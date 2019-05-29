import React, { useState, useEffect } from "react";
import pull from "lodash/pull";
import isEqual from "lodash/isEqual";
import { Grid, withStyles } from "@material-ui/core";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Redirect } from "react-router-dom";

import BoardHeader from "./BoardHeader";
import Columns from "./Columns";
import VoteCountSnackbar from "./VoteCountSnackbar";
import { FlexContainer } from "./styled";
import { connectSocket, defaultBoard } from "../utils";
import {
  CONNECT,
  CREATE_BOARD,
  UPDATE_BOARD,
  JOIN_BOARD,
  JOIN_ERROR,
  SET_MAX_VOTES,
  RESET_VOTES
} from "../utils/eventNames";
import {
  createRole,
  setMaxVoteCountAndReset,
  getVotesLeft,
  ROLE_MODERATOR,
  ROLE_PARTICIPANT,
  getUser
} from "../utils/roleHandlers";

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  header: {
    padding: theme.spacing(2)
  }
});

function Board(props) {
  const boardId = props.match.params.boardId;
  const socket = connectSocket(boardId);
  const [board, setBoard] = useState(defaultBoard);
  const [isSnackbarOpen, setSnackbar] = useState(false);
  const { classes } = props;

  useEffect(() => {
    document.title = `Retro | ${board.title}`;

    socket.on(CONNECT, () => {
      if (isEqual(board, defaultBoard)) socket.emit(JOIN_BOARD, boardId);
    });

    socket.on(CREATE_BOARD, newBoard => {
      const { boardId, maxVoteCount } = newBoard;
      createRole(ROLE_MODERATOR, boardId, maxVoteCount);
      setBoard(newBoard);
    });

    socket.on(UPDATE_BOARD, newBoard => {
      setBoard(newBoard);
    });

    socket.on(SET_MAX_VOTES, (newBoard, newVoteCount) => {
      setMaxVoteCountAndReset(newVoteCount, newBoard.boardId);
      setBoard(newBoard);
      openSnackbar();
    });

    socket.on(RESET_VOTES, newBoard => {
      setMaxVoteCountAndReset(newBoard.maxVoteCount, newBoard.boardId);
      setBoard(newBoard);
      openSnackbar();
    });

    socket.on(JOIN_BOARD, boardData => {
      const { boardId, maxVoteCount } = boardData;

      if (getUser(boardId) === null) {
        createRole(ROLE_PARTICIPANT, boardId, maxVoteCount);
      }

      setBoard(boardData);
    });

    socket.on(JOIN_ERROR, () => {
      setBoard({ ...board, error: true });
    });

    return () => {
      socket.close();
    };
  }, [board, boardId, socket]);

  function openSnackbar() {
    setSnackbar(true);
  }

  function closeSnackbar() {
    setSnackbar(false);
  }

  function onDragEnd(dragResult) {
    const { source, destination, type, combine } = dragResult;
    const { columns, columnOrder, items } = board;

    if (combine) {
      handleCombine(items, columns, dragResult);
      return;
    }

    if (!destination) {
      return;
    }

    if (isSamePosition(source, destination)) {
      return;
    }

    if (type === "column") {
      handleColumnDrag(dragResult, columnOrder);
      return;
    }

    if (isSameColumn(columns, source, destination)) {
      handleInsideColumnDrag(dragResult, columns);
      return;
    }

    handleNormalDrag(dragResult, columns);
  }

  function handleCombine(items, columns, dragResult) {
    const { combine, draggableId, source } = dragResult;

    // get all related objects of the context of combine
    const itemToCombine = items[combine.draggableId];
    const itemToCombineWith = items[draggableId];
    const itemToCombineWithColumn = columns[source.droppableId];

    // extract the item content
    const originalContent = itemToCombine.content;
    const contentToMerge = itemToCombineWith.content;

    // combine the content
    const newContent = `${originalContent}\n===\n${contentToMerge}`;
    itemToCombine.content = newContent;

    // remove the merged item
    const newItemIds = pull(
      itemToCombineWithColumn.itemIds,
      itemToCombineWith.id
    );

    // update state
    const newColumn = {
      ...itemToCombineWithColumn,
      itemIds: newItemIds
    };

    const newBoard = {
      ...board,
      columns: {
        ...columns,
        [newColumn.id]: newColumn
      }
    };

    setBoard(newBoard);
    socket.emit(UPDATE_BOARD, newBoard, boardId);
  }

  function handleColumnDrag(dragResult, columnOrder) {
    const { source, destination, draggableId } = dragResult;
    const newColumnOrder = Array.from(columnOrder);

    newColumnOrder.splice(source.index, 1);
    newColumnOrder.splice(destination.index, 0, draggableId);

    const newBoard = {
      ...board,
      columnOrder: newColumnOrder
    };

    setBoard(newBoard);
    socket.emit(UPDATE_BOARD, newBoard, boardId);
  }

  function handleInsideColumnDrag(dragResult, columns) {
    const { source, destination, draggableId } = dragResult;

    const startColumn = columns[source.droppableId];
    const newItemIds = Array.from(startColumn.itemIds);

    newItemIds.splice(source.index, 1);
    newItemIds.splice(destination.index, 0, draggableId);

    const newCol = { ...startColumn, itemIds: newItemIds };
    const newBoard = {
      ...board,
      columns: {
        ...columns,
        [newCol.id]: newCol
      }
    };

    setBoard(newBoard);
    socket.emit(UPDATE_BOARD, newBoard, boardId);
  }

  function handleNormalDrag(dragResult, columns) {
    const { source, destination, draggableId } = dragResult;

    const startColumn = columns[source.droppableId];
    const destinationColumn = columns[destination.droppableId];

    const startItems = Array.from(startColumn.itemIds);
    const destinationItems = Array.from(destinationColumn.itemIds);

    startItems.splice(source.index, 1);
    destinationItems.splice(destination.index, 0, draggableId);

    const newStartColumn = {
      ...startColumn,
      itemIds: startItems
    };

    const newDestinationColumn = {
      ...destinationColumn,
      itemIds: destinationItems
    };

    const newBoard = {
      ...board,
      columns: {
        ...columns,
        [newStartColumn.id]: newStartColumn,
        [newDestinationColumn.id]: newDestinationColumn
      }
    };

    setBoard(newBoard);
    socket.emit(UPDATE_BOARD, newBoard, boardId);
  }

  function isSamePosition(source, destination) {
    return (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    );
  }

  function isSameColumn(columns, source, destination) {
    return columns[source.droppableId] === columns[destination.droppableId];
  }

  function renderBoard(columns, items, boardId) {
    return board.columnOrder.map((columnId, index) => {
      const column = columns[columnId];
      return (
        <Columns
          key={column.id}
          column={column}
          itemMap={items}
          index={index}
          boardId={boardId}
          openSnackbar={openSnackbar}
        />
      );
    });
  }

  function renderSnackbar(voteCount) {
    return (
      <VoteCountSnackbar
        id="vote-count-snackbar"
        open={isSnackbarOpen}
        handleClose={closeSnackbar}
        autoHideDuration={3000}
        voteCount={voteCount}
      />
    );
  }

  if (board.error) {
    return <Redirect to={"/error"} />;
  }

  return (
    <Grid container className={classes.root} direction="column">
      <Grid item xs={12}>
        <Grid container className={classes.header} direction="row">
          <BoardHeader
            title={board.title}
            boardId={boardId}
            maxVoteCount={board.maxVoteCount}
          />
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable
            droppableId="allColumns"
            direction="horizontal"
            type="column"
          >
            {provided => (
              <FlexContainer
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {renderBoard(board.columns, board.items, boardId)}
                {provided.placeholder}
              </FlexContainer>
            )}
          </Droppable>
        </DragDropContext>
      </Grid>
      {renderSnackbar(getVotesLeft(boardId))}
    </Grid>
  );
}

export default withStyles(styles)(Board);

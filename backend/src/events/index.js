const {
  createBoard,
  updateBoard,
  joinBoard,
  exportBoard,
  unblurCards
} = require("./board-events");
const { createColumn, deleteColumn, sortColumn } = require("./column-events");
const {
  createCard,
  editCard,
  deleteCard,
  upvoteCard
} = require("./card-events");

const boardEvents = (io, client) => {
  createBoard(io, client);
  updateBoard(io, client);
  joinBoard(io, client);
  exportBoard(io, client);
  unblurCards(io, client);
};

const columnEvents = (io, client) => {
  createColumn(io, client);
  deleteColumn(io, client);
  sortColumn(io, client);
};

const cardEvents = (io, client) => {
  createCard(io, client);
  editCard(io, client);
  deleteCard(io, client);
  upvoteCard(io, client);
};

module.exports = {
  boardEvents,
  columnEvents,
  cardEvents
};

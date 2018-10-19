import styled, { css } from "styled-components";

export const FlexContainer = styled.div`
  display: flex;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin: 1em;
`;

export const Greeting = styled.div`
  display: flex;
  justify-content: center;
  font-size: 1.5em;
  margin-top: 1em;
`;

export const ColumnContainer = styled.div`
  width: 400px;
  margin: 1em;
  border: 1px solid lightgrey;
  border-radius: 2px;
  background-color: white;
  box-shadow: 2px 2px 1px lightgrey;
  display: flex;
  flex-direction: column;
`;

export const ColumnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: #f5f5f5;
  padding: 1em;
`;

export const HeaderContainer = styled.div`
  margin: 1.5em 1em 0em 1em;
  display: flex;
  justify-content: space-between;
`;

export const ItemContainer = styled.div`
  margin-bottom: 1.5em;
  box-shadow: 4px 4px 1px lightgrey;
`;

export const CardFooter = styled.div`
  padding: 0.5em;
  display: flex;
  justify-content: space-between;
`;

export const CardPoints = styled.div`
  font-weight: bold;
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  height: 2em;
  width: 2em;
  margin: 0.5em;
`;

export const NavbarButton = styled.div`
  margin: 0.5em;
`;

export const CardContainer = styled.div``;

export const CardWrapper = styled.div`
  position: relative;
  border: ${p => (p.isBlurred ? "1px" : "0px")} solid lightgrey;
  ${CardContainer} {
    filter: blur(${p => (p.isBlurred ? "5px" : 0)});
  }
`;

export const Unblur = styled.a`
  position: absolute;
  top: 5.5%;
  right: 4%;
  color: black;

  &:hover {
    color: #757575;
  }
`;

export const Navbar = styled.nav`
  box-shadow: 0 6px 6px -2px grey;
`;

export const NavbarBrand = styled.p`
  color: white;
  font-family: "Lobster", cursive !important;
  font-size: 2em;
`;

export const ItemsContainerStyles = css`
  padding: 1em;
  transition: background-color 0.2s ease;
  flex-grow: 1;
  min-height: 100px;
  background-color: ${p => (p.isDraggingOver ? "#f5f5f5" : "inherit")};
`;

export const BoardTitleStyles = css`
  margin: 0 !important;
`;

export const ColumnTitleStyles = css`
  padding: 8px;
  margin-bottom: 0 !important;
`;

export const ColumnActionButtonStyles = css`
  margin-left: 0.2em;
`;
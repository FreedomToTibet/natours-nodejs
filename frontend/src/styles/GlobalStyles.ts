import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    --color-primary: #55c57a;
    --color-primary-light: #7ed56f;
    --color-primary-dark: #28b485;
    --color-grey-dark: #777;
    --color-white: #fff;
    --color-black: #000;
    --color-grey-light-1: #f7f7f7;
    --color-grey-light-2: #eee;

    --default-font-size: 1.6rem;
  }

  *,
  *::before,
  *::after {
    margin: 0;
    padding: 0;
    box-sizing: inherit;
  }

  html {
    font-size: 62.5%;
  }

  body {
    box-sizing: border-box;
    font-family: 'Lato', sans-serif;
    font-weight: 400;
    line-height: 1.7;
    color: var(--color-grey-dark);
  }
`;

export default GlobalStyles;

import Header from "./../Header/Header";
import { Container } from "semantic-ui-react";
import styles from "./Layout.module.css";

const Layout = (props) => {
  return (
    <Container>
      <Header />
      <div className={styles.mt8}>{props.children}</div>
    </Container>
  );
};
export default Layout;

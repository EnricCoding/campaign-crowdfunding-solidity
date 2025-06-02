import { Menu, Container, Icon } from "semantic-ui-react";
import Link from "next/link";
import styles from "./Header.module.css";

const Header = () => {
  return (
    <Menu borderless inverted fixed="top" className={styles.menu}>
      <Container>
        <Menu.Item as={Link} href="/" header>
          <Icon name="ethereum" className={styles.icon} />
          Enric Learning Solidity
        </Menu.Item>
      </Container>
    </Menu>
  );
};

export default Header;

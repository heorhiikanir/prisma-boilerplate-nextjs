import React, { FC, useState } from 'react';
import Link from 'next/link';
import { NextRouter, useRouter } from 'next/router';
import { signOut } from 'next-auth/react';
import { withBem } from 'utils/bem';
import { Routes } from 'lib-client/constants';
import { getAvatarPath } from 'utils';
import Dropdown from 'components/Dropdown';
import { useViewport } from 'components/hooks';
import { NavLink } from 'components/Navbar';
import { FaCat } from 'react-icons/fa';
import { FiUser } from 'react-icons/fi';
import { AiOutlineHome, AiOutlineFileAdd, AiOutlineEdit } from 'react-icons/ai';
import {
  RiMenuLine,
  RiLogoutBoxRLine,
  RiLoginBoxLine,
  RiAccountBoxLine,
} from 'react-icons/ri';
import { IoPeopleOutline, IoSettingsOutline } from 'react-icons/io5';
import { useMe } from 'lib-client/react-query/auth/useMe';
import { ClientUser } from 'types';
import ThemeChanger from 'components/ThemeChanger';

const isActive: (router: NextRouter, pathname: string) => boolean = (router, pathname) =>
  router.asPath === pathname;

interface ItemsArgs {
  router: NextRouter;
  me: ClientUser;
  onHamburgerClick?: () => void;
  mobileMenuOpen?: boolean;
  isGetDropdownItems?: boolean;
}

interface FilterItemsArgs extends ItemsArgs {
  argsArray: string[];
}

const b = withBem('navbar');

const getAllItems = ({
  router,
  me,
  onHamburgerClick,
  mobileMenuOpen,
  isGetDropdownItems,
}: ItemsArgs) => ({
  home: (
    <Link key="home" href={Routes.SITE.HOME}>
      <a>
        <NavLink icon={<AiOutlineHome />} isActive={isActive(router, Routes.SITE.HOME)}>
          Home
        </NavLink>
      </a>
    </Link>
  ),
  profile: me && (
    <Link
      key="profile"
      href={{
        pathname: '/[username]',
        query: { username: me.username as string },
      }}
    >
      <a>
        <NavLink icon={<FiUser />} isActive={isActive(router, `/${me.username}/`)}>
          Profile
        </NavLink>
      </a>
    </Link>
  ),
  users: (
    <Link key="users" href={Routes.SITE.USERS}>
      <a>
        <NavLink
          icon={<IoPeopleOutline />}
          isActive={isActive(router, Routes.SITE.USERS)}
        >
          Users
        </NavLink>
      </a>
    </Link>
  ),
  create: (
    <Link key="create" href={Routes.SITE.CREATE}>
      <a>
        <NavLink
          icon={<AiOutlineFileAdd />}
          isActive={isActive(router, Routes.SITE.CREATE)}
        >
          Create
        </NavLink>
      </a>
    </Link>
  ),
  drafts: (
    <Link key="drafts" href={Routes.SITE.DRAFTS}>
      <a>
        <NavLink icon={<AiOutlineEdit />} isActive={isActive(router, Routes.SITE.DRAFTS)}>
          Drafts
        </NavLink>
      </a>
    </Link>
  ),
  theme: <ThemeChanger key="theme" />,
  settings: (
    <Link key="settings" href={Routes.SITE.SETTINGS}>
      <a>
        <NavLink
          icon={<IoSettingsOutline />}
          isActive={isActive(router, Routes.SITE.SETTINGS)}
        >
          Settings
        </NavLink>
      </a>
    </Link>
  ),
  logout: (
    <a
      key="logout"
      onClick={(e) => {
        e.preventDefault();
        signOut();
      }}
    >
      <NavLink icon={<RiLogoutBoxRLine />}>Log out</NavLink>
    </a>
  ),
  login: (
    <Link key="login" href={Routes.SITE.LOGIN}>
      <a>
        <NavLink icon={<RiLoginBoxLine />}>Log in</NavLink>
      </a>
    </Link>
  ),
  register: (
    <Link key="register" href={Routes.SITE.REGISTER}>
      <a>
        <NavLink icon={<RiAccountBoxLine />}>Register</NavLink>
      </a>
    </Link>
  ),
  // prevent recursion
  avatar: !isGetDropdownItems && me && (
    <Dropdown
      key="avatar"
      items={getDropdownItems({ router, me, onHamburgerClick, mobileMenuOpen })}
    >
      <img className={b('avatar')} src={getAvatarPath(me)} />
    </Dropdown>
  ),
  justAvatar: me && (
    <img
      className={b('just-avatar')}
      key="justAvatar"
      src={getAvatarPath(me)}
      width="50"
      height="50"
    />
  ),
  hamburger: (
    <button
      key="hamburger"
      type="button"
      aria-label="Toggle mobile menu"
      onClick={onHamburgerClick}
      className={b('hamburger')}
    >
      <RiMenuLine
        className={`transition duration-100 ease h-8 w-8 ${
          mobileMenuOpen ? 'transform rotate-90' : ''
        }`}
      />
    </button>
  ),
});

// helper methods
const objectFilter = (obj, predicate) =>
  Object.fromEntries(Object.entries(obj).filter(predicate));

const filterAllItems = ({ argsArray, ...restArgs }: FilterItemsArgs) =>
  argsArray?.length > 0
    ? Object.values(
        objectFilter(getAllItems(restArgs), ([key, value]) => argsArray.includes(key))
      )
    : [];

// main nav definition
const navConfig = {
  leftNav: {
    loggedIn: ['home', 'users', 'profile', 'create', 'drafts'],
    loggedOut: ['home', 'users'],
  },
  rightNav: {
    loggedIn: {
      desktop: ['theme', 'avatar'],
      mobile: ['settings', 'theme', 'justAvatar', 'logout'],
    },
    loggedOut: ['theme', 'login', 'register'],
  },
  dropdown: { loggedIn: ['settings', 'logout'], loggedOut: [] },
};

// getLeftNavLinks, getRightNavLinks, getDropdownItems
// don't care isMobile/desktop, but where they are called
const getLeftNavLinks = ({ router, me }: ItemsArgs) => {
  const argsArray = me ? navConfig.leftNav.loggedIn : navConfig.leftNav.loggedOut;

  return filterAllItems({ router, me, argsArray });
};

const getRightNavLinks = ({
  router,
  me,
  onHamburgerClick,
  mobileMenuOpen,
}: ItemsArgs) => {
  const argsArray = me
    ? mobileMenuOpen
      ? navConfig.rightNav.loggedIn.mobile
      : navConfig.rightNav.loggedIn.desktop
    : navConfig.rightNav.loggedOut;

  return filterAllItems({ router, me, argsArray, onHamburgerClick, mobileMenuOpen });
};

const getAllNavLinks = (args: ItemsArgs) => {
  return getLeftNavLinks(args).concat(getRightNavLinks(args));
};

function getDropdownItems(args: ItemsArgs) {
  const argsArray = args?.me ? navConfig.dropdown.loggedIn : navConfig.dropdown.loggedOut;

  return filterAllItems({ ...args, argsArray, isGetDropdownItems: true });
}

const Navbar: FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { width } = useViewport();
  const isMobile = width < 640;

  const { me, isLoadingMe } = useMe();
  const _onHamburgerClick = () => setMobileMenuOpen(!mobileMenuOpen);

  const args = {
    router,
    me,
    mobileMenuOpen,
    onHamburgerClick: _onHamburgerClick,
  };

  const rightNav = !isMobile && getRightNavLinks(args);
  const leftNav = getLeftNavLinks(args);
  const avatar = !isMobile && me && getAllItems(args)?.avatar;
  const hamburger = isMobile && getAllItems(args)?.hamburger;
  const mobileNav = getAllNavLinks(args);

  return (
    <header className={b()}>
      {/* desktop navbar */}
      <div className={b('desktop')}>
        <div className={b('left-wrapper')}>
          <div className={b('brand')}>
            <Link href={Routes.SITE.HOME}>
              <a className={b('brand-link')}>
                <FaCat className={b('logo')} />
                <span className={b('brand-text')}>NPB</span>
              </a>
            </Link>
          </div>
          <div className={b('left-nav')}>{leftNav}</div>
        </div>
        <div className={b('right-nav')}>
          {rightNav}
          {hamburger}
        </div>
      </div>

      {/* mobile menu */}
      {mobileMenuOpen && <nav className={b('mobile-nav')}>{mobileNav}</nav>}
    </header>
  );
};

export default Navbar;

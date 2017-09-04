import * as React from 'react';

const getIcon = (name: string, className: string | undefined) => {
  switch (name) {
    case 'close': {
      return (
        <svg className={className} height="100%" viewBox="2 2.002 19.998 19.997">
          <path d="M19.07 4.93c-3.902-3.904-10.238-3.904-14.142 0-3.903 3.902-3.903 10.238 0 14.142 3.903 3.902 10.24 3.902 14.142 0 3.905-3.904 3.905-10.24 0-14.143zm-2.828 9.898l-1.414 1.414L12 13.414l-2.83 2.828-1.413-1.414L10.587 12l-2.83-2.83L9.17 7.758l2.83 2.83 2.828-2.83 1.414 1.414L13.414 12l2.828 2.828z" />
        </svg>
      );
    }
    case 'close2': {
      return (
        <svg className={className} height="100%" viewBox="0 0 15.414 15.414">
          <path d="M15.414 2.117L13.297 0l-5.59 5.59L2.117 0 0 2.117l5.59 5.59L0 13.297l2.117 2.117 5.59-5.59 5.59 5.59 2.117-2.117-5.59-5.59"/>
        </svg>
      );
    }
    case 'upload': {
      return (
        <svg className={className} height="100%" viewBox="0 0.621 79 53.713">
          <path d="M72.227 39.8C71.234 34.785 66.81 31 61.5 31c-4.215 0-7.867 2.392-9.697 5.885-4.383.473-7.803 4.185-7.803 8.7 0 4.833 3.916 8.75 8.75 8.75h18.96c4.023 0 7.29-3.27 7.29-7.294 0-3.85-2.997-6.97-6.773-7.24zm-7.81 4.325v5.834h-5.833v-5.835H54.21l7.29-7.29 7.29 7.29h-4.374zM27.378 11.803c0 2.73 2.243 4.97 4.978 4.97s4.978-2.24 4.978-4.97-2.244-4.97-4.978-4.97-4.978 2.24-4.978 4.97zm7.466 0c0 1.387-1.1 2.485-2.49 2.485s-2.488-1.098-2.488-2.485c0-1.387 1.1-2.485 2.49-2.485s2.488 1.098 2.488 2.485z" />
          <path d="M42.597 37.895h-2.833l-6.222-6.95 8.128-8.62 8.77 9.575c.562-.622 1.187-1.17 1.836-1.685l-9.673-10.57c-.255-.27-.62-.413-.99-.387-.32.018-.62.156-.837.388L31.87 29.08 18.98 14.697c-.28-.32-.707-.474-1.127-.408-.276.044-.53.182-.72.388L2.49 30.38V4.35c0-.71.533-1.244 1.244-1.244h48.533c.71 0 1.245.533 1.245 1.243V29.33c.79-.5 1.618-.932 2.488-1.276V4.35C56 2.305 54.313.62 52.267.62H3.733C1.687.62 0 2.306 0 4.35V36.65c0 2.044 1.687 3.728 3.733 3.728h37.392c.398-.884.89-1.718 1.472-2.485zm-38.864 0c-.71 0-1.245-.533-1.245-1.243v-2.62l15.536-16.657 18.395 20.52H3.732z" />
        </svg>
      );
    }
    case 'error': {
      return (
        <svg className={className} height="100%" viewBox="2 2 20 20">
          <path fill="none" d="M0 0h24v24H0V0z" />
          <path d="M11 15h2v2h-2zM11 7h2v6h-2z" />
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
        </svg>
      );
    }
    case 'checkmark': {
      return (
        <svg className={className} width="19" height="15" viewBox="0 0 19 15">
          <path d="M6.05 11.467L1.533 6.95 0 8.482l6.05 6.05 13-13L17.517 0z" fill="#FFF" fillRule="evenodd" />
        </svg>
      );
    }
    case 'dropdown': {
      return (
        <svg className={className} width="9" height="6" viewBox="0 0 9 6">
          <path fill="#A6A6A6" fillRule="evenodd" d="M7.939 0L4.5 3.439 1.061 0 0 1.061l4.5 4.5 4.5-4.5z" />
        </svg>
      );
    }
    case 'arrow-back': {
      return (
        <svg className={className} height="100%" viewBox="0 0 24 24" >
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
      );
    }
    case 'plus': {
      return (
        <svg className={className} height="100%" viewBox="0 0 51 51">
          <path d="M0 19.89v11.118h19.631V51h11.634V31.008H51V19.89H31.265V0H19.63v19.89H0z" fill="#d70065" />
        </svg>
      );
    }
    case 'plus': {
      return (
        <svg className={className} height="100%" viewBox="0 0 51 51">
          <path d="M0 19.89v11.118h19.631V51h11.634V31.008H51V19.89H31.265V0H19.63v19.89H0z" fill="#d70065" />
        </svg>
      );
    }
    case 'add_circle': {
      return (
        <svg className={className} height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0h24v24H0z" fill="none"/>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
        </svg>
      );
    }
    case 'comment': {
      return (
        <svg className={className} height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
          <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
          <path d="M0 0h24v24H0z" fill="none"/>
        </svg>
      );
    }
    case 'delete': {
      return (
        <svg className={className} viewBox="0 0 15 18" height="100%"><desc>Created using Figma</desc><use xlinkHref="#a" transform="translate(1.29 5.33)"/><use xlinkHref="#b" transform="translate(.16 .06)"/><defs><path id="a" fillRule="evenodd" d="M1.128 12.613c-.623 0-1.128-.5-1.128-1.117V0h12.418v11.496c0 .617-.505 1.117-1.13 1.117H1.128zm9.58-11.505h-1.75v9.296c0 .48.392.868.876.868a.87.87 0 0 0 .873-.868V1.108zm-5.374 0h1.75v9.296c0 .48-.39.868-.875.868a.87.87 0 0 1-.876-.868V1.108zm-1.9 0h-1.75v9.296c0 .48.393.868.876.868a.87.87 0 0 0 .874-.868V1.108z"/><path id="b" d="M13.544 1.195H9.112V.558S9.092 0 8.528 0h-2.42c-.564 0-.545.558-.545.558v.637H1.13c-.624 0-1.13.5-1.13 1.118V4.15h14.673V2.313c0-.617-.506-1.118-1.13-1.118z"/></defs></svg>
      );
    }
    case 'edit': {
      return (
        <svg className={className} viewBox="0 0 12 12" height="100%">
          <path id="a" fillRule="evenodd" d="M0 9.3v2.448h2.448L9.67 4.525 7.223 2.077 0 9.3zm11.557-6.66c.255-.256.255-.67 0-.925L10.033.19c-.255-.254-.67-.254-.924 0L7.914 1.386l2.447 2.448 1.195-1.194z"/>
        </svg>
      );
    }
    case 'upvote': {
      return (
        <svg className={className} fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0h24v24H0z" fill="none"/>
          <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"/>
        </svg>

      );
    }
    case 'downvote': {
      return(
        <svg className={className} fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0h24v24H0z" fill="none"/>
          <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
        </svg>
      );
    }
    case 'idea': {
      return(
        <svg className={className} width="23" height="21" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
          <g transform="translate(.25)" fill="#8F8F8F">
            <use xlinkHref="#a"/>
            <use xlinkHref="#b"/>
            <use xlinkHref="#c"/>
            <use xlinkHref="#d"/>
            <use xlinkHref="#e"/>
            <use xlinkHref="#f"/>
          </g>
          <defs>
            <path id="a" d="M10.435.813c0-.45.364-.813.813-.813.45 0 .814.364.814.813v2.125c0 .45-.365.813-.814.813-.45 0-.813-.363-.813-.812V.813z"/>
            <path id="b" d="M19.1 4.022c.35-.282.86-.228 1.144.12.282.35.23.862-.12 1.144l-1.652 1.337c-.348.283-.86.23-1.143-.12-.284-.35-.23-.86.12-1.143l1.65-1.338z"/>
            <path id="c" d="M22.475 13.492c.1-.438-.17-.875-.61-.976l-2.07-.478c-.437-.1-.874.172-.975.61-.1.437.172.874.61.975l2.07.478c.438.102.874-.17.975-.608z"/>
            <path id="d" d="M.997 14.1c-.438.102-.875-.17-.976-.608-.1-.438.173-.875.61-.976l2.07-.478c.438-.1.875.172.976.61.1.437-.172.874-.61.975l-2.07.478z"/>
            <path id="e" d="M2.252 4.143c-.282.35-.23.86.12 1.143l1.652 1.338c.35.282.86.228 1.144-.12.282-.35.23-.862-.12-1.144L3.395 4.022c-.35-.282-.86-.228-1.144.12z"/>
            <path id="f" fillRule="evenodd" d="M11.132 6.104c-2.99 0-5.42 2.31-5.42 5.15 0 1.75.92 3.286 2.322 4.22v1.663c0 .404.35.735.775.735h4.645c.426 0 .774-.33.774-.735v-1.663c1.4-.934 2.323-2.47 2.323-4.22 0-2.84-2.432-5.15-5.42-5.15zM8.81 20.078c0 .405.347.736.773.736h3.098c.426 0 .775-.33.775-.736v-.735H8.81v.735zm3.87-5.368l.66-.442c1.044-.69 1.664-1.816 1.664-3.015 0-2.03-1.735-3.678-3.872-3.678-2.137 0-3.872 1.648-3.872 3.678 0 1.2.62 2.324 1.665 3.015l.658.44v1.693h3.098v-1.69z"/>
          </defs>
        </svg>
      );
    }
    default:
      return null;
  }
};

const Icon: React.SFC<IIcon> = ({ name, className }) => getIcon(name, className);

interface IIcon {
  name: string;
  className?: string;
}

export default Icon;

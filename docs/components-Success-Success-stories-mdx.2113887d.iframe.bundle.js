"use strict";(self.webpackChunk_citizenlab_cl2_component_library=self.webpackChunk_citizenlab_cl2_component_library||[]).push([[321],{"./node_modules/@mdx-js/react/lib/index.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{NF:()=>withMDXComponents,Zo:()=>MDXProvider,ah:()=>useMDXComponents,pC:()=>MDXContext});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js");const MDXContext=react__WEBPACK_IMPORTED_MODULE_0__.createContext({});function withMDXComponents(Component){return function boundMDXComponent(props){const allComponents=useMDXComponents(props.components);return react__WEBPACK_IMPORTED_MODULE_0__.createElement(Component,{...props,allComponents})}}function useMDXComponents(components){const contextComponents=react__WEBPACK_IMPORTED_MODULE_0__.useContext(MDXContext);return react__WEBPACK_IMPORTED_MODULE_0__.useMemo((()=>"function"==typeof components?components(contextComponents):{...contextComponents,...components}),[contextComponents,components])}const emptyObject={};function MDXProvider({components,children,disableParentContext}){let allComponents;return allComponents=disableParentContext?"function"==typeof components?components({}):components||emptyObject:useMDXComponents(components),react__WEBPACK_IMPORTED_MODULE_0__.createElement(MDXContext.Provider,{value:allComponents},children)}},"./node_modules/@storybook/addon-docs/dist/blocks.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{$4:()=>_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__.$4,Xz:()=>_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__.Xz,h_:()=>_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__.h_,oG:()=>_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__.oG});var _storybook_client_logger__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("@storybook/client-logger"),_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/@storybook/blocks/dist/index.mjs");(0,_storybook_client_logger__WEBPACK_IMPORTED_MODULE_0__.deprecate)("Import from '@storybook/addon-docs/blocks' is deprecated. Please import from '@storybook/blocks' instead.")},"./src/components/Success/Success.stories.mdx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{__namedExportsOrder:()=>__namedExportsOrder,default:()=>Success_stories,withShortStrings:()=>withShortStrings});var react=__webpack_require__("./node_modules/react/index.js"),lib=__webpack_require__("./node_modules/@mdx-js/react/lib/index.js"),blocks=__webpack_require__("./node_modules/@storybook/addon-docs/dist/blocks.mjs"),Icon=__webpack_require__("./src/components/Icon/index.tsx"),CSSTransition=__webpack_require__("./node_modules/react-transition-group/esm/CSSTransition.js"),styled_components_browser_esm=__webpack_require__("./node_modules/styled-components/dist/styled-components.browser.esm.js"),styleUtils=__webpack_require__("./src/utils/styleUtils.ts"),jsx_runtime=__webpack_require__("./node_modules/react/jsx-runtime.js");const SuccessMessageText=styled_components_browser_esm.ZP.div`
  font-size: ${styleUtils.CH.base}px;
  color: ${styleUtils.O9.success};
  font-weight: 400;
  line-height: normal;
`,CheckmarkIcon=(0,styled_components_browser_esm.ZP)(Icon.Z)`
  flex: 0 0 24px;
  fill: ${styleUtils.O9.success};
  margin-right: 13px;
`,StyledSuccessMessageInner=styled_components_browser_esm.ZP.div`
  width: 100%;
  display: flex;
  align-items: center;
  border-radius: ${props=>props.theme.borderRadius};
  background: ${props=>props.showBackground?styleUtils.O9.successLight:"transparent"};
  padding: 10px 13px;
`,Container=styled_components_browser_esm.ZP.div`
  position: relative;
  overflow: hidden;

  &.success-enter {
    max-height: 0px;
    opacity: 0;

    &.success-enter-active {
      max-height: 60px;
      opacity: 1;
      transition: max-height ${350}ms cubic-bezier(0.165, 0.84, 0.44, 1),
        opacity ${350}ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }

  &.success-exit {
    max-height: 100px;
    opacity: 1;

    &.success-exit-active {
      max-height: 0px;
      opacity: 0;
      transition: max-height ${350}ms cubic-bezier(0.19, 1, 0.22, 1),
        opacity ${350}ms cubic-bezier(0.19, 1, 0.22, 1);
    }
  }
`;class Success extends react.PureComponent{static defaultProps={animate:!0};constructor(props){super(props),this.state={mounted:!1}}componentDidMount(){this.setState({mounted:!0})}componentWillUnmount(){this.setState({mounted:!1})}render(){const{text,className,animate,showIcon,showBackground}=this.props,{mounted}=this.state;return(0,jsx_runtime.jsx)(CSSTransition.Z,{in:!(!mounted||!text),timeout:350,mountOnEnter:!0,unmountOnExit:!0,enter:animate,exit:animate,classNames:"success",children:(0,jsx_runtime.jsx)(Container,{className:`e2e-success-message ${className}`,children:(0,jsx_runtime.jsxs)(StyledSuccessMessageInner,{showBackground,children:[showIcon&&(0,jsx_runtime.jsx)(CheckmarkIcon,{name:"check"}),(0,jsx_runtime.jsx)(SuccessMessageText,{children:text})]})})})}}Success.displayName="Success";try{Success.displayName="Success",Success.__docgenInfo={description:"",displayName:"Success",props:{text:{defaultValue:null,description:"",name:"text",required:!0,type:{name:"string | Element | null"}},showIcon:{defaultValue:null,description:"",name:"showIcon",required:!1,type:{name:"boolean | undefined"}},showBackground:{defaultValue:null,description:"",name:"showBackground",required:!1,type:{name:"boolean | undefined"}},animate:{defaultValue:{value:"true"},description:"",name:"animate",required:!1,type:{name:"boolean"}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string | undefined"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/Success/index.tsx#Success"]={docgenInfo:Success.__docgenInfo,name:"Success",path:"src/components/Success/index.tsx#Success"})}catch(__react_docgen_typescript_loader_error){}var dist=__webpack_require__("./node_modules/@storybook/addon-knobs/dist/index.js");const withShortStrings=()=>(0,jsx_runtime.jsx)(Success,{text:(0,dist.text)("Label","A Badge with label"),animate:!0});withShortStrings.storyName="With short strings",withShortStrings.parameters={storySource:{source:'<Success text={text("Label", "A Badge with label")} animate={true} />'}};const componentMeta={title:"Components/Success",component:Success,tags:["stories-mdx"],includeStories:["withShortStrings"]};componentMeta.parameters=componentMeta.parameters||{},componentMeta.parameters.docs={...componentMeta.parameters.docs||{},page:function MDXContent(props={}){const{wrapper:MDXLayout}=Object.assign({},(0,lib.ah)(),props.components);return MDXLayout?(0,jsx_runtime.jsx)(MDXLayout,{...props,children:(0,jsx_runtime.jsx)(_createMdxContent,{})}):_createMdxContent();function _createMdxContent(){const _components=Object.assign({h1:"h1"},(0,lib.ah)(),props.components);return(0,jsx_runtime.jsxs)(jsx_runtime.Fragment,{children:[(0,jsx_runtime.jsx)(blocks.h_,{title:"Components/Success",component:Success}),"\n",(0,jsx_runtime.jsx)(_components.h1,{id:"success",children:"Success"}),"\n",(0,jsx_runtime.jsx)(blocks.$4,{of:Success}),"\n",(0,jsx_runtime.jsx)(blocks.Xz,{children:(0,jsx_runtime.jsx)(blocks.oG,{name:"With short strings",children:(0,jsx_runtime.jsx)(Success,{text:(0,dist.text)("Label","A Badge with label"),animate:!0})})})]})}}};const Success_stories=componentMeta,__namedExportsOrder=["withShortStrings"]}}]);
//# sourceMappingURL=components-Success-Success-stories-mdx.2113887d.iframe.bundle.js.map
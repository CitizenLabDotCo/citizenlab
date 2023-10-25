"use strict";(self.webpackChunk_citizenlab_cl2_component_library=self.webpackChunk_citizenlab_cl2_component_library||[]).push([[930],{"./node_modules/@mdx-js/react/lib/index.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{NF:()=>withMDXComponents,Zo:()=>MDXProvider,ah:()=>useMDXComponents,pC:()=>MDXContext});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js");const MDXContext=react__WEBPACK_IMPORTED_MODULE_0__.createContext({});function withMDXComponents(Component){return function boundMDXComponent(props){const allComponents=useMDXComponents(props.components);return react__WEBPACK_IMPORTED_MODULE_0__.createElement(Component,{...props,allComponents})}}function useMDXComponents(components){const contextComponents=react__WEBPACK_IMPORTED_MODULE_0__.useContext(MDXContext);return react__WEBPACK_IMPORTED_MODULE_0__.useMemo((()=>"function"==typeof components?components(contextComponents):{...contextComponents,...components}),[contextComponents,components])}const emptyObject={};function MDXProvider({components,children,disableParentContext}){let allComponents;return allComponents=disableParentContext?"function"==typeof components?components({}):components||emptyObject:useMDXComponents(components),react__WEBPACK_IMPORTED_MODULE_0__.createElement(MDXContext.Provider,{value:allComponents},children)}},"./node_modules/@storybook/addon-actions/dist/index.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{aD:()=>chunk_AY7I2SME.aD});var chunk_AY7I2SME=__webpack_require__("./node_modules/@storybook/addon-actions/dist/chunk-AY7I2SME.mjs")},"./node_modules/@storybook/addon-docs/dist/blocks.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{$4:()=>_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__.$4,Xz:()=>_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__.Xz,h_:()=>_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__.h_,oG:()=>_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__.oG});var _storybook_client_logger__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("@storybook/client-logger"),_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/@storybook/blocks/dist/index.mjs");(0,_storybook_client_logger__WEBPACK_IMPORTED_MODULE_0__.deprecate)("Import from '@storybook/addon-docs/blocks' is deprecated. Please import from '@storybook/blocks' instead.")},"./node_modules/@storybook/addon-docs/dist/chunk-HLWAVYOI.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{r:()=>DocsRenderer});var react=__webpack_require__("./node_modules/react/index.js"),react_dom=__webpack_require__("./node_modules/react-dom/index.js"),dist=__webpack_require__("./node_modules/@storybook/blocks/dist/index.mjs"),defaultComponents={code:dist.bD,a:dist.Ct,...dist.lO},ErrorBoundary=class extends react.Component{constructor(){super(...arguments),this.state={hasError:!1}}static getDerivedStateFromError(){return{hasError:!0}}componentDidCatch(err){let{showException}=this.props;showException(err)}render(){let{hasError}=this.state,{children}=this.props;return hasError?null:react.createElement(react.Fragment,null,children)}},DocsRenderer=class{constructor(){this.render=async(context,docsParameter,element)=>{let components={...defaultComponents,...docsParameter?.components},TDocs=dist.WI;return new Promise(((resolve,reject)=>{__webpack_require__.e(433).then(__webpack_require__.bind(__webpack_require__,"./node_modules/@mdx-js/react/index.js")).then((({MDXProvider})=>(async(node,el)=>new Promise((resolve=>{react_dom.render(node,el,(()=>resolve(null)))})))(react.createElement(ErrorBoundary,{showException:reject,key:Math.random()},react.createElement(MDXProvider,{components},react.createElement(TDocs,{context,docsParameter}))),element))).then((()=>resolve()))}))},this.unmount=element=>{var el;el=element,react_dom.unmountComponentAtNode(el)}}}},"./node_modules/@storybook/addon-docs/dist/index.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{$4:()=>_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__.$4});__webpack_require__("./node_modules/@storybook/addon-docs/dist/chunk-HLWAVYOI.mjs");var _storybook_blocks__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/@storybook/blocks/dist/index.mjs")},"./src/components/LocaleSwitcher/LocaleSwitcher.stories.mdx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{default:()=>LocaleSwitcher_stories,defaultStory:()=>defaultStory,withANoneEmptyValue:()=>withANoneEmptyValue});var react=__webpack_require__("./node_modules/react/index.js"),lib=__webpack_require__("./node_modules/@mdx-js/react/lib/index.js"),blocks=__webpack_require__("./node_modules/@storybook/addon-docs/dist/blocks.mjs"),dist=__webpack_require__("./node_modules/@storybook/addon-docs/dist/index.mjs"),addon_actions_dist=(__webpack_require__("./node_modules/@storybook/addon-knobs/dist/index.js"),__webpack_require__("./node_modules/@storybook/addon-actions/dist/index.mjs")),lodash=__webpack_require__("./node_modules/lodash/lodash.js"),styled_components_browser_esm=__webpack_require__("./node_modules/styled-components/dist/styled-components.browser.esm.js"),polished_esm=__webpack_require__("./node_modules/polished/dist/polished.esm.js"),styleUtils=__webpack_require__("./src/utils/styleUtils.ts"),Box=__webpack_require__("./src/components/Box/index.tsx"),jsx_runtime=__webpack_require__("./node_modules/react/jsx-runtime.js");const Container=(0,styled_components_browser_esm.ZP)(Box.Z)`
  width: 100%;
  display: flex;
`,StyledButton=styled_components_browser_esm.ZP.button`
  color: ${styleUtils.O9.primary};
  font-size: ${styleUtils.CH.s}px;
  display: flex;
  align-items: center;
  text-transform: uppercase;
  font-weight: 500;
  white-space: nowrap;
  padding: 7px 8px;
  margin-right: 6px;
  border-radius: ${props=>props.theme.borderRadius};
  background: ${styleUtils.O9.grey200};
  cursor: pointer;
  transition: all 80ms ease-out;

  ${styleUtils.t6`
    flex-direction: row-reverse;
  `}

  &.last {
    margin-right: 0px;
  }

  &:not(.selected):hover {
    color: ${styleUtils.O9.primary};
    background: ${(0,polished_esm.m4)(styleUtils.O9.primary,.2)};
  }

  &.selected {
    color: #fff;
    background: ${styleUtils.O9.primary};
  }
`,Dot=styled_components_browser_esm.ZP.div`
  flex: 0 0 9px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: ${styleUtils.O9.red500};
  margin-right: 5px;

  ${styleUtils.t6`
    margin-right: 0px;
    margin-left: 5px;
  `}

  &.notEmpty {
    background: ${styleUtils.O9.success};
  }
`,isSingleMultilocObjectFilled=(locale,values)=>Object.getOwnPropertyNames(values).every((key=>!(0,lodash.isEmpty)((0,lodash.get)(values,`[${key}][${locale}]`)))),isValueForLocaleFilled=(locale,values)=>Array.isArray(values)?values.every((value=>isSingleMultilocObjectFilled(locale,value))):isSingleMultilocObjectFilled(locale,values);class LocaleSwitcher extends react.PureComponent{removeFocus=event=>{event.preventDefault()};handleOnClick=locale=>event=>{event.preventDefault(),this.props.selectedLocale!==locale&&this.props.onSelectedLocaleChange(locale)};render(){const{locales,selectedLocale,values,className}=this.props;return locales&&locales.length>1?(0,jsx_runtime.jsx)(Container,{className,children:locales.map(((locale,index)=>(0,jsx_runtime.jsxs)(StyledButton,{onMouseDown:this.removeFocus,onClick:this.handleOnClick(locale),type:"button",className:["e2e-localeswitcher",locale,locale===selectedLocale?"selected":"",index+1===locales.length?"last":""].join(" "),children:[values&&(0,jsx_runtime.jsx)(Dot,{className:isValueForLocaleFilled(locale,values)?"notEmpty":"empty"}),locale]},locale)))}):null}}LocaleSwitcher.displayName="LocaleSwitcher";const components_LocaleSwitcher=LocaleSwitcher;try{LocaleSwitcher.displayName="LocaleSwitcher",LocaleSwitcher.__docgenInfo={description:"",displayName:"LocaleSwitcher",props:{onSelectedLocaleChange:{defaultValue:null,description:"",name:"onSelectedLocaleChange",required:!0,type:{name:"(selectedLocale: string) => void"}},locales:{defaultValue:null,description:"",name:"locales",required:!0,type:{name:"string[]"}},selectedLocale:{defaultValue:null,description:"",name:"selectedLocale",required:!0,type:{name:"string"}},values:{defaultValue:null,description:"",name:"values",required:!1,type:{name:"MultilocFormValues | MultilocFormValues[] | undefined"}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string | undefined"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/LocaleSwitcher/index.tsx#LocaleSwitcher"]={docgenInfo:LocaleSwitcher.__docgenInfo,name:"LocaleSwitcher",path:"src/components/LocaleSwitcher/index.tsx#LocaleSwitcher"})}catch(__react_docgen_typescript_loader_error){}const defaultStory=()=>(0,jsx_runtime.jsx)("div",{style:{maxWidth:"150px"},children:(0,jsx_runtime.jsx)(components_LocaleSwitcher,{onSelectedLocaleChange:(0,addon_actions_dist.aD)("selected locale changed"),locales:["en-GB","nl-BE"],selectedLocale:"en-GB",values:{bleh:{"en-GB":"","nl-BE":""}}})});defaultStory.storyName="default",defaultStory.parameters={storySource:{source:'<div style={{\n  maxWidth: "150px"\n}}><LocaleSwitcher onSelectedLocaleChange={action("selected locale changed")} locales={["en-GB", "nl-BE"]} selectedLocale="en-GB" values={{\n    bleh: {\n      "en-GB": "",\n      "nl-BE": ""\n    }\n  }} /></div>'}};const withANoneEmptyValue=()=>(0,jsx_runtime.jsx)("div",{style:{maxWidth:"150px"},children:(0,jsx_runtime.jsx)(components_LocaleSwitcher,{onSelectedLocaleChange:(0,addon_actions_dist.aD)("selected locale changed"),locales:["en-GB","nl-BE"],selectedLocale:"en-GB",values:{bleh:{"en-GB":"","nl-BE":"Een willekeurige waarde"}}})});withANoneEmptyValue.storyName="with a none-empty value",withANoneEmptyValue.parameters={storySource:{source:'<div style={{\n  maxWidth: "150px"\n}}><LocaleSwitcher onSelectedLocaleChange={action("selected locale changed")} locales={["en-GB", "nl-BE"]} selectedLocale="en-GB" values={{\n    bleh: {\n      "en-GB": "",\n      "nl-BE": "Een willekeurige waarde"\n    }\n  }} /></div>'}};const componentMeta={title:"Components/LocaleSwitcher",component:components_LocaleSwitcher,tags:["stories-mdx"],includeStories:["defaultStory","withANoneEmptyValue"]};componentMeta.parameters=componentMeta.parameters||{},componentMeta.parameters.docs={...componentMeta.parameters.docs||{},page:function MDXContent(props={}){const{wrapper:MDXLayout}=Object.assign({},(0,lib.ah)(),props.components);return MDXLayout?(0,jsx_runtime.jsx)(MDXLayout,{...props,children:(0,jsx_runtime.jsx)(_createMdxContent,{})}):_createMdxContent();function _createMdxContent(){const _components=Object.assign({h1:"h1"},(0,lib.ah)(),props.components);return(0,jsx_runtime.jsxs)(jsx_runtime.Fragment,{children:[(0,jsx_runtime.jsx)(blocks.h_,{title:"Components/LocaleSwitcher",component:components_LocaleSwitcher}),"\n",(0,jsx_runtime.jsx)(_components.h1,{id:"localeswitcher",children:"LocaleSwitcher"}),"\n",(0,jsx_runtime.jsx)(dist.$4,{of:components_LocaleSwitcher}),"\n",(0,jsx_runtime.jsx)(blocks.Xz,{children:(0,jsx_runtime.jsx)(blocks.oG,{name:"default",children:(0,jsx_runtime.jsx)("div",{style:{maxWidth:"150px"},children:(0,jsx_runtime.jsx)(components_LocaleSwitcher,{onSelectedLocaleChange:(0,addon_actions_dist.aD)("selected locale changed"),locales:["en-GB","nl-BE"],selectedLocale:"en-GB",values:{bleh:{"en-GB":"","nl-BE":""}}})})})}),"\n",(0,jsx_runtime.jsx)(blocks.Xz,{children:(0,jsx_runtime.jsx)(blocks.oG,{name:"with a none-empty value",children:(0,jsx_runtime.jsx)("div",{style:{maxWidth:"150px"},children:(0,jsx_runtime.jsx)(components_LocaleSwitcher,{onSelectedLocaleChange:(0,addon_actions_dist.aD)("selected locale changed"),locales:["en-GB","nl-BE"],selectedLocale:"en-GB",values:{bleh:{"en-GB":"","nl-BE":"Een willekeurige waarde"}}})})})})]})}}};const LocaleSwitcher_stories=componentMeta},"./src/components/Box/index.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});var styled_components__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/styled-components/dist/styled-components.browser.esm.js");const Box=styled_components__WEBPACK_IMPORTED_MODULE_0__.ZP.div`
  // colors and background
  ${props=>styled_components__WEBPACK_IMPORTED_MODULE_0__.iv`
    ${props.color?`color: ${props.color}`:""};
    ${props.bgColor?`background-color: ${props.bgColor}`:""};
    ${props.background?`background: ${props.background}`:""};
    ${props.bg?`background: ${props.bg}`:""};
    ${"number"==typeof props.opacity?`opacity: ${props.opacity}`:""};
  `}

  // shadow
  ${props=>styled_components__WEBPACK_IMPORTED_MODULE_0__.iv`
    ${props.boxShadow?`box-shadow: ${props.boxShadow}`:""};
  `}

  // padding
  ${props=>styled_components__WEBPACK_IMPORTED_MODULE_0__.iv`
    ${props.padding?`padding: ${props.padding}`:""};
    ${props.p?`padding: ${props.p}`:""};

    // top
    ${props.paddingY?`padding-top: ${props.paddingY}`:""};
    ${props.py?`padding-top: ${props.py}`:""};
    ${props.paddingTop?`padding-top: ${props.paddingTop}`:""};
    ${props.pt?`padding-top: ${props.pt}`:""};

    // bottom
    ${props.paddingY?`padding-bottom: ${props.paddingY}`:""};
    ${props.py?`padding-bottom: ${props.py}`:""};
    ${props.paddingBottom?`padding-bottom: ${props.paddingBottom}`:""};
    ${props.pb?`padding-bottom: ${props.pb}`:""};

    // left
    ${props.paddingX?`padding-left: ${props.paddingX}`:""};
    ${props.px?`padding-left: ${props.px}`:""};
    ${props.paddingLeft?`padding-left: ${props.paddingLeft}`:""};
    ${props.pl?`padding-left: ${props.pl}`:""};

    // right
    ${props.paddingX?`padding-right: ${props.paddingX}`:""};
    ${props.px?`padding-right: ${props.px}`:""};
    ${props.paddingRight?`padding-right: ${props.paddingRight}`:""};
    ${props.pr?`padding-right: ${props.pr}`:""};
  `}
 
  // margin
  ${props=>styled_components__WEBPACK_IMPORTED_MODULE_0__.iv`
    ${props.margin?`margin: ${props.margin}`:""};
    ${props.m?`margin: ${props.m}`:""};

    // top
    ${props.marginY?`margin-top: ${props.marginY}`:""};
    ${props.my?`margin-top: ${props.my}`:""};
    ${props.marginTop?`margin-top: ${props.marginTop}`:""};
    ${props.mt?`margin-top: ${props.mt}`:""};

    // bottom
    ${props.marginY?`margin-bottom: ${props.marginY}`:""};
    ${props.my?`margin-bottom: ${props.my}`:""};
    ${props.marginBottom?`margin-bottom: ${props.marginBottom}`:""};
    ${props.mb?`margin-bottom: ${props.mb}`:""};

    // left
    ${props.marginX?`margin-left: ${props.marginX}`:""};
    ${props.mx?`margin-left: ${props.mx}`:""};
    ${props.marginLeft?`margin-left: ${props.marginLeft}`:""};
    ${props.ml?`margin-left: ${props.ml}`:""};

    // right
    ${props.marginX?`margin-right: ${props.marginX}`:""};
    ${props.mx?`margin-right: ${props.mx}`:""};
    ${props.marginRight?`margin-right: ${props.marginRight}`:""};
    ${props.mr?`margin-right: ${props.mr}`:""};
  `}

  // height
  ${props=>styled_components__WEBPACK_IMPORTED_MODULE_0__.iv`
    ${props.height?`height: ${props.height}`:""};
    ${props.h?`height: ${props.h}`:""};
    ${props.maxHeight?`max-height: ${props.maxHeight}`:""};
    ${props.minHeight?`min-height: ${props.minHeight}`:""};
  `}
 
  // width
  ${props=>styled_components__WEBPACK_IMPORTED_MODULE_0__.iv`
    ${props.width?`width: ${props.width}`:""};
    ${props.w?`width: ${props.w}`:""};
    ${props.maxWidth?`max-width: ${props.maxWidth}`:""};
    ${props.minWidth?`min-width: ${props.minWidth}`:""};
  `}
 
  // display
  ${props=>styled_components__WEBPACK_IMPORTED_MODULE_0__.iv`
    ${props.display?`display: ${props.display}`:""};
  `}

  // overflow
  ${props=>styled_components__WEBPACK_IMPORTED_MODULE_0__.iv`
    ${props.overflow?`overflow: ${props.overflow}`:""};
    ${props.overflowX?`overflow-x: ${props.overflowX}`:""};
    ${props.overflowY?`overflow-y: ${props.overflowY}`:""};
  `}

  // position
  ${props=>styled_components__WEBPACK_IMPORTED_MODULE_0__.iv`
    ${props.position?`position: ${props.position}`:""};
    ${props.left?`left: ${props.left}`:""};
    ${props.right?`right: ${props.right}`:""};
    ${props.top?`top: ${props.top}`:""};
    ${props.bottom?`bottom: ${props.bottom}`:""};
  `}

 // flex
  ${props=>styled_components__WEBPACK_IMPORTED_MODULE_0__.iv`
    ${props.flexDirection?`flex-direction: ${props.flexDirection}`:""};
    ${props.flexWrap?`flex-wrap: ${props.flexWrap}`:""};
    ${props.justifyContent?`justify-content: ${props.justifyContent}`:""};
    ${props.alignItems?`align-items: ${props.alignItems}`:""};
    ${props.alignContent?`align-content: ${props.alignContent}`:""};
    ${props.order?`order: ${props.order}`:""};
    ${props.flexGrow?`flex-grow: ${props.flexGrow}`:""};
    ${props.flexShrink?`flex-shrink: ${props.flexShrink}`:""};
    ${props.flexBasis?`flex-basis: ${props.flexBasis}`:""};
    ${props.flex?`flex: ${props.flex}`:""};
    ${props.alignSelf?`align-self: ${props.alignSelf}`:""};
    ${props.gap?`gap: ${props.gap}`:""};
  `}

 // border
  ${props=>styled_components__WEBPACK_IMPORTED_MODULE_0__.iv`
    ${props.border?`border: ${props.border}`:""};
    ${props.borderTop?`border-top: ${props.borderTop}`:""};
    ${props.borderLeft?`border-left: ${props.borderLeft}`:""};
    ${props.borderRight?`border-right: ${props.borderRight}`:""};
    ${props.borderBottom?`border-bottom: ${props.borderBottom}`:""};
    ${props.borderWidth?`border-width: ${props.borderWidth}`:""};
    ${props.borderStyle?`border-style: ${props.borderStyle}`:""};
    ${props.borderRadius?`border-radius: ${props.borderRadius}`:""};
    ${props.borderColor?`border-color: ${props.borderColor}`:""};
  `}

 // visibility
  ${props=>styled_components__WEBPACK_IMPORTED_MODULE_0__.iv`
    ${props.visibility?`visibility: ${props.visibility}`:""};
  `}

  // z-index
  ${props=>styled_components__WEBPACK_IMPORTED_MODULE_0__.iv`
    ${props.zIndex?`z-index: ${props.zIndex}`:""};
  `}
`,__WEBPACK_DEFAULT_EXPORT__=Box;try{Box.displayName="Box",Box.__docgenInfo={description:"",displayName:"Box",props:{background:{defaultValue:null,description:"",name:"background",required:!1,type:{name:"string | undefined"}},margin:{defaultValue:null,description:"",name:"margin",required:!1,type:{name:"string | undefined"}},m:{defaultValue:null,description:"",name:"m",required:!1,type:{name:"string | undefined"}},marginLeft:{defaultValue:null,description:"",name:"marginLeft",required:!1,type:{name:"string | undefined"}},ml:{defaultValue:null,description:"",name:"ml",required:!1,type:{name:"string | undefined"}},marginRight:{defaultValue:null,description:"",name:"marginRight",required:!1,type:{name:"string | undefined"}},mr:{defaultValue:null,description:"",name:"mr",required:!1,type:{name:"string | undefined"}},marginTop:{defaultValue:null,description:"",name:"marginTop",required:!1,type:{name:"string | undefined"}},mt:{defaultValue:null,description:"",name:"mt",required:!1,type:{name:"string | undefined"}},marginBottom:{defaultValue:null,description:"",name:"marginBottom",required:!1,type:{name:"string | undefined"}},mb:{defaultValue:null,description:"",name:"mb",required:!1,type:{name:"string | undefined"}},marginX:{defaultValue:null,description:"",name:"marginX",required:!1,type:{name:"string | undefined"}},mx:{defaultValue:null,description:"",name:"mx",required:!1,type:{name:"string | undefined"}},marginY:{defaultValue:null,description:"",name:"marginY",required:!1,type:{name:"string | undefined"}},my:{defaultValue:null,description:"",name:"my",required:!1,type:{name:"string | undefined"}},padding:{defaultValue:null,description:"",name:"padding",required:!1,type:{name:"string | undefined"}},p:{defaultValue:null,description:"",name:"p",required:!1,type:{name:"string | undefined"}},paddingLeft:{defaultValue:null,description:"",name:"paddingLeft",required:!1,type:{name:"string | undefined"}},pl:{defaultValue:null,description:"",name:"pl",required:!1,type:{name:"string | undefined"}},paddingRight:{defaultValue:null,description:"",name:"paddingRight",required:!1,type:{name:"string | undefined"}},pr:{defaultValue:null,description:"",name:"pr",required:!1,type:{name:"string | undefined"}},paddingTop:{defaultValue:null,description:"",name:"paddingTop",required:!1,type:{name:"string | undefined"}},pt:{defaultValue:null,description:"",name:"pt",required:!1,type:{name:"string | undefined"}},paddingBottom:{defaultValue:null,description:"",name:"paddingBottom",required:!1,type:{name:"string | undefined"}},pb:{defaultValue:null,description:"",name:"pb",required:!1,type:{name:"string | undefined"}},paddingX:{defaultValue:null,description:"",name:"paddingX",required:!1,type:{name:"string | undefined"}},px:{defaultValue:null,description:"",name:"px",required:!1,type:{name:"string | undefined"}},paddingY:{defaultValue:null,description:"",name:"paddingY",required:!1,type:{name:"string | undefined"}},py:{defaultValue:null,description:"",name:"py",required:!1,type:{name:"string | undefined"}},position:{defaultValue:null,description:"",name:"position",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"static"'},{value:'"relative"'},{value:'"fixed"'},{value:'"absolute"'},{value:'"sticky"'}]}},top:{defaultValue:null,description:"",name:"top",required:!1,type:{name:"string | undefined"}},bottom:{defaultValue:null,description:"",name:"bottom",required:!1,type:{name:"string | undefined"}},left:{defaultValue:null,description:"",name:"left",required:!1,type:{name:"string | undefined"}},right:{defaultValue:null,description:"",name:"right",required:!1,type:{name:"string | undefined"}},zIndex:{defaultValue:null,description:"",name:"zIndex",required:!1,type:{name:"string | undefined"}},height:{defaultValue:null,description:"",name:"height",required:!1,type:{name:"string | undefined"}},h:{defaultValue:null,description:"",name:"h",required:!1,type:{name:"string | undefined"}},maxHeight:{defaultValue:null,description:"",name:"maxHeight",required:!1,type:{name:"string | undefined"}},minHeight:{defaultValue:null,description:"",name:"minHeight",required:!1,type:{name:"string | undefined"}},width:{defaultValue:null,description:"",name:"width",required:!1,type:{name:"string | undefined"}},w:{defaultValue:null,description:"",name:"w",required:!1,type:{name:"string | undefined"}},maxWidth:{defaultValue:null,description:"",name:"maxWidth",required:!1,type:{name:"string | undefined"}},minWidth:{defaultValue:null,description:"",name:"minWidth",required:!1,type:{name:"string | undefined"}},display:{defaultValue:null,description:"",name:"display",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"inherit"'},{value:'"block"'},{value:'"inline-block"'},{value:'"inline"'},{value:'"flex"'},{value:'"inline-flex"'},{value:'"none"'}]}},overflow:{defaultValue:null,description:"",name:"overflow",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"hidden"'},{value:'"initial"'},{value:'"inherit"'},{value:'"visible"'},{value:'"scroll"'},{value:'"auto"'}]}},overflowX:{defaultValue:null,description:"",name:"overflowX",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"hidden"'},{value:'"initial"'},{value:'"inherit"'},{value:'"visible"'},{value:'"scroll"'},{value:'"auto"'}]}},overflowY:{defaultValue:null,description:"",name:"overflowY",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"hidden"'},{value:'"initial"'},{value:'"inherit"'},{value:'"visible"'},{value:'"scroll"'},{value:'"auto"'}]}},visibility:{defaultValue:null,description:"",name:"visibility",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"hidden"'},{value:'"initial"'},{value:'"inherit"'},{value:'"visible"'}]}},flex:{defaultValue:null,description:"",name:"flex",required:!1,type:{name:"string | undefined"}},bgColor:{defaultValue:null,description:"",name:"bgColor",required:!1,type:{name:"string | undefined"}},opacity:{defaultValue:null,description:"",name:"opacity",required:!1,type:{name:"number | undefined"}},boxShadow:{defaultValue:null,description:"",name:"boxShadow",required:!1,type:{name:"string | undefined"}},bg:{defaultValue:null,description:"",name:"bg",required:!1,type:{name:"string | undefined"}},flexDirection:{defaultValue:null,description:"",name:"flexDirection",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"initial"'},{value:'"inherit"'},{value:'"row"'},{value:'"row-reverse"'},{value:'"column"'},{value:'"column-reverse"'}]}},flexWrap:{defaultValue:null,description:"",name:"flexWrap",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"initial"'},{value:'"inherit"'},{value:'"nowrap"'},{value:'"wrap"'},{value:'"wrap-reverse"'}]}},alignItems:{defaultValue:null,description:"",name:"alignItems",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"center"'},{value:'"initial"'},{value:'"inherit"'},{value:'"flex-start"'},{value:'"flex-end"'},{value:'"baseline"'},{value:'"stretch"'}]}},justifyContent:{defaultValue:null,description:"",name:"justifyContent",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"center"'},{value:'"initial"'},{value:'"inherit"'},{value:'"flex-start"'},{value:'"flex-end"'},{value:'"space-between"'},{value:'"space-around"'},{value:'"space-evenly"'}]}},alignContent:{defaultValue:null,description:"",name:"alignContent",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"center"'},{value:'"initial"'},{value:'"inherit"'},{value:'"flex-start"'},{value:'"flex-end"'},{value:'"space-between"'},{value:'"space-around"'},{value:'"space-evenly"'}]}},order:{defaultValue:null,description:"",name:"order",required:!1,type:{name:"number | undefined"}},flexGrow:{defaultValue:null,description:"",name:"flexGrow",required:!1,type:{name:"number | undefined"}},flexShrink:{defaultValue:null,description:"",name:"flexShrink",required:!1,type:{name:"number | undefined"}},flexBasis:{defaultValue:null,description:"",name:"flexBasis",required:!1,type:{name:"number | undefined"}},alignSelf:{defaultValue:null,description:"",name:"alignSelf",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"center"'},{value:'"initial"'},{value:'"inherit"'},{value:'"auto"'},{value:'"flex-start"'},{value:'"flex-end"'},{value:'"baseline"'},{value:'"stretch"'}]}},gap:{defaultValue:null,description:"",name:"gap",required:!1,type:{name:"string | undefined"}},border:{defaultValue:null,description:"",name:"border",required:!1,type:{name:"string | undefined"}},borderTop:{defaultValue:null,description:"",name:"borderTop",required:!1,type:{name:"string | undefined"}},borderBottom:{defaultValue:null,description:"",name:"borderBottom",required:!1,type:{name:"string | undefined"}},borderLeft:{defaultValue:null,description:"",name:"borderLeft",required:!1,type:{name:"string | undefined"}},borderRight:{defaultValue:null,description:"",name:"borderRight",required:!1,type:{name:"string | undefined"}},borderColor:{defaultValue:null,description:"",name:"borderColor",required:!1,type:{name:"string | undefined"}},borderWidth:{defaultValue:null,description:"",name:"borderWidth",required:!1,type:{name:"string | undefined"}},borderRadius:{defaultValue:null,description:"",name:"borderRadius",required:!1,type:{name:"string | undefined"}},borderStyle:{defaultValue:null,description:"",name:"borderStyle",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"hidden"'},{value:'"initial"'},{value:'"none"'},{value:'"dotted"'},{value:'"dashed"'},{value:'"solid"'},{value:'"double"'},{value:'"groove"'},{value:'"ridge"'},{value:'"inset"'},{value:'"outset"'}]}},ref:{defaultValue:null,description:"",name:"ref",required:!1,type:{name:"((instance: HTMLDivElement | null) => void) | RefObject<HTMLDivElement> | null | undefined"}},theme:{defaultValue:null,description:"",name:"theme",required:!1,type:{name:"any"}},as:{defaultValue:null,description:"",name:"as",required:!1,type:{name:"undefined"}},forwardedAs:{defaultValue:null,description:"",name:"forwardedAs",required:!1,type:{name:"undefined"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/Box/index.tsx#Box"]={docgenInfo:Box.__docgenInfo,name:"Box",path:"src/components/Box/index.tsx#Box"})}catch(__react_docgen_typescript_loader_error){}}}]);
//# sourceMappingURL=components-LocaleSwitcher-LocaleSwitcher-stories-mdx.c3a3402a.iframe.bundle.js.map
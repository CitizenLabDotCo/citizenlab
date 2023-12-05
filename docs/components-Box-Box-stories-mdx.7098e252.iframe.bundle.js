(self.webpackChunk_citizenlab_cl2_component_library=self.webpackChunk_citizenlab_cl2_component_library||[]).push([[483],{"./node_modules/@mdx-js/react/lib/index.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{NF:()=>withMDXComponents,Zo:()=>MDXProvider,ah:()=>useMDXComponents,pC:()=>MDXContext});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js");const MDXContext=react__WEBPACK_IMPORTED_MODULE_0__.createContext({});function withMDXComponents(Component){return function boundMDXComponent(props){const allComponents=useMDXComponents(props.components);return react__WEBPACK_IMPORTED_MODULE_0__.createElement(Component,{...props,allComponents})}}function useMDXComponents(components){const contextComponents=react__WEBPACK_IMPORTED_MODULE_0__.useContext(MDXContext);return react__WEBPACK_IMPORTED_MODULE_0__.useMemo((()=>"function"==typeof components?components(contextComponents):{...contextComponents,...components}),[contextComponents,components])}const emptyObject={};function MDXProvider({components,children,disableParentContext}){let allComponents;return allComponents=disableParentContext?"function"==typeof components?components({}):components||emptyObject:useMDXComponents(components),react__WEBPACK_IMPORTED_MODULE_0__.createElement(MDXContext.Provider,{value:allComponents},children)}},"./node_modules/@storybook/addon-docs/dist/blocks.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{$4:()=>_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__.$4,Xz:()=>_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__.Xz,h_:()=>_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__.h_,oG:()=>_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__.oG});var _storybook_client_logger__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("@storybook/client-logger"),_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/@storybook/blocks/dist/index.mjs");(0,_storybook_client_logger__WEBPACK_IMPORTED_MODULE_0__.deprecate)("Import from '@storybook/addon-docs/blocks' is deprecated. Please import from '@storybook/blocks' instead.")},"./node_modules/@storybook/addon-docs/dist/chunk-HLWAVYOI.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{r:()=>DocsRenderer});var react=__webpack_require__("./node_modules/react/index.js"),react_dom=__webpack_require__("./node_modules/react-dom/index.js"),dist=__webpack_require__("./node_modules/@storybook/blocks/dist/index.mjs"),defaultComponents={code:dist.bD,a:dist.Ct,...dist.lO},ErrorBoundary=class extends react.Component{constructor(){super(...arguments),this.state={hasError:!1}}static getDerivedStateFromError(){return{hasError:!0}}componentDidCatch(err){let{showException}=this.props;showException(err)}render(){let{hasError}=this.state,{children}=this.props;return hasError?null:react.createElement(react.Fragment,null,children)}},DocsRenderer=class{constructor(){this.render=async(context,docsParameter,element)=>{let components={...defaultComponents,...docsParameter?.components},TDocs=dist.WI;return new Promise(((resolve,reject)=>{__webpack_require__.e(433).then(__webpack_require__.bind(__webpack_require__,"./node_modules/@mdx-js/react/index.js")).then((({MDXProvider})=>(async(node,el)=>new Promise((resolve=>{react_dom.render(node,el,(()=>resolve(null)))})))(react.createElement(ErrorBoundary,{showException:reject,key:Math.random()},react.createElement(MDXProvider,{components},react.createElement(TDocs,{context,docsParameter}))),element))).then((()=>resolve()))}))},this.unmount=element=>{var el;el=element,react_dom.unmountComponentAtNode(el)}}}},"./node_modules/@storybook/addon-docs/dist/index.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{$4:()=>_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__.$4});__webpack_require__("./node_modules/@storybook/addon-docs/dist/chunk-HLWAVYOI.mjs");var _storybook_blocks__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/@storybook/blocks/dist/index.mjs")},"./src/components/Box/Box.stories.mdx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__,defaultStory:()=>defaultStory});__webpack_require__("./node_modules/react/index.js");var _home_runner_work_citizenlab_citizenlab_cl2_component_library_node_modules_storybook_addon_docs_dist_shims_mdx_react_shim__WEBPACK_IMPORTED_MODULE_7__=__webpack_require__("./node_modules/@mdx-js/react/lib/index.js"),_storybook_addon_docs_blocks__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/@storybook/addon-docs/dist/blocks.mjs"),_storybook_addon_docs__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/@storybook/addon-docs/dist/index.mjs"),_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/@storybook/addon-knobs/dist/index.js"),_utils_styleUtils__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./src/utils/styleUtils.ts"),___WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./src/components/Box/index.tsx"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("./node_modules/react/jsx-runtime.js");const defaultStory=()=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(___WEBPACK_IMPORTED_MODULE_5__.Z,{bgColor:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.select)("Background color",_utils_styleUtils__WEBPACK_IMPORTED_MODULE_4__.O9,"#fff"),color:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.select)("Color",_utils_styleUtils__WEBPACK_IMPORTED_MODULE_4__.O9,"#333"),opacity:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.number)("Opacity"),p:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Padding"),pt:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Padding top"),pl:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Padding left"),pr:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Padding right"),pb:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Padding bottom"),px:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Padding X"),py:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Padding Y"),m:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Margin"),mt:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Margin top"),ml:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Margin left"),mr:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Margin right"),mb:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Margin bottom"),mx:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Margin X"),my:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Margin Y"),w:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Width"),h:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Height"),maxWidth:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Max width"),maxHeight:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Max height"),minWidth:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Min width"),minHeight:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Min height"),overflow:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.select)("Overflow",["visible","hidden","scroll","auto","initial","inherit"]),display:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.select)("Display",["block","inline-block","inline","flex","inline-flex","none","inherit"]),flexDirection:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.select)("Flex direction",["row","row-reverse","column","column-reverse"]),justifyContent:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.select)("Justify content",["flex-start","flex-end","center","space-between","space-around","space-evenly"]),alignItems:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.select)("Align items",["flex-start","flex-end","center","baseline","stretch"]),position:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.select)("Position",["static","relative","fixed","absolute","sticky"]),top:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Top"),left:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Left"),right:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Right"),bottom:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Bottom"),border:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Border"),visibility:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.boolean)("Visibility",!0)?"visible":"hidden",gap:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Gap"),children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("div",{children:"Hi, I am the first child of this Box!"}),"\n",(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("div",{children:"Hi, I am the second child of this Box!"})]});defaultStory.storyName="default",defaultStory.parameters={storySource:{source:'<Box bgColor={select("Background color", colors, "#fff")} color={select("Color", colors, "#333")} opacity={number("Opacity")} p={text("Padding")} pt={text("Padding top")} pl={text("Padding left")} pr={text("Padding right")} pb={text("Padding bottom")} px={text("Padding X")} py={text("Padding Y")} m={text("Margin")} mt={text("Margin top")} ml={text("Margin left")} mr={text("Margin right")} mb={text("Margin bottom")} mx={text("Margin X")} my={text("Margin Y")} w={text("Width")} h={text("Height")} maxWidth={text("Max width")} maxHeight={text("Max height")} minWidth={text("Min width")} minHeight={text("Min height")} overflow={select("Overflow", ["visible", "hidden", "scroll", "auto", "initial", "inherit"])} display={select("Display", ["block", "inline-block", "inline", "flex", "inline-flex", "none", "inherit"])} flexDirection={select("Flex direction", ["row", "row-reverse", "column", "column-reverse"])} justifyContent={select("Justify content", ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"])} alignItems={select("Align items", ["flex-start", "flex-end", "center", "baseline", "stretch"])} position={select("Position", ["static", "relative", "fixed", "absolute", "sticky"])} top={text("Top")} left={text("Left")} right={text("Right")} bottom={text("Bottom")} border={text("Border")} visibility={boolean("Visibility", true) ? "visible" : "hidden"} gap={text("Gap")}><div>{"Hi, I am the first child of this Box!"}</div>{"\\n"}<div>{"Hi, I am the second child of this Box!"}</div></Box>'}};const componentMeta={title:"Components/Box",component:___WEBPACK_IMPORTED_MODULE_5__.Z,tags:["stories-mdx"],includeStories:["defaultStory"]};componentMeta.parameters=componentMeta.parameters||{},componentMeta.parameters.docs={...componentMeta.parameters.docs||{},page:function MDXContent(props={}){const{wrapper:MDXLayout}=Object.assign({},(0,_home_runner_work_citizenlab_citizenlab_cl2_component_library_node_modules_storybook_addon_docs_dist_shims_mdx_react_shim__WEBPACK_IMPORTED_MODULE_7__.ah)(),props.components);return MDXLayout?(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(MDXLayout,{...props,children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_createMdxContent,{})}):_createMdxContent();function _createMdxContent(){const _components=Object.assign({h1:"h1"},(0,_home_runner_work_citizenlab_citizenlab_cl2_component_library_node_modules_storybook_addon_docs_dist_shims_mdx_react_shim__WEBPACK_IMPORTED_MODULE_7__.ah)(),props.components);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.Fragment,{children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_storybook_addon_docs_blocks__WEBPACK_IMPORTED_MODULE_1__.h_,{title:"Components/Box",component:___WEBPACK_IMPORTED_MODULE_5__.Z}),"\n",(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_components.h1,{id:"box",children:"Box"}),"\n",(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_storybook_addon_docs__WEBPACK_IMPORTED_MODULE_2__.$4,{of:___WEBPACK_IMPORTED_MODULE_5__.Z}),"\n",(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_storybook_addon_docs_blocks__WEBPACK_IMPORTED_MODULE_1__.Xz,{children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_storybook_addon_docs_blocks__WEBPACK_IMPORTED_MODULE_1__.oG,{name:"default",children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(___WEBPACK_IMPORTED_MODULE_5__.Z,{bgColor:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.select)("Background color",_utils_styleUtils__WEBPACK_IMPORTED_MODULE_4__.O9,"#fff"),color:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.select)("Color",_utils_styleUtils__WEBPACK_IMPORTED_MODULE_4__.O9,"#333"),opacity:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.number)("Opacity"),p:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Padding"),pt:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Padding top"),pl:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Padding left"),pr:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Padding right"),pb:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Padding bottom"),px:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Padding X"),py:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Padding Y"),m:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Margin"),mt:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Margin top"),ml:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Margin left"),mr:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Margin right"),mb:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Margin bottom"),mx:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Margin X"),my:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Margin Y"),w:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Width"),h:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Height"),maxWidth:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Max width"),maxHeight:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Max height"),minWidth:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Min width"),minHeight:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Min height"),overflow:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.select)("Overflow",["visible","hidden","scroll","auto","initial","inherit"]),display:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.select)("Display",["block","inline-block","inline","flex","inline-flex","none","inherit"]),flexDirection:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.select)("Flex direction",["row","row-reverse","column","column-reverse"]),justifyContent:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.select)("Justify content",["flex-start","flex-end","center","space-between","space-around","space-evenly"]),alignItems:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.select)("Align items",["flex-start","flex-end","center","baseline","stretch"]),position:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.select)("Position",["static","relative","fixed","absolute","sticky"]),top:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Top"),left:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Left"),right:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Right"),bottom:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Bottom"),border:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Border"),visibility:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.boolean)("Visibility",!0)?"visible":"hidden",gap:(0,_storybook_addon_knobs__WEBPACK_IMPORTED_MODULE_3__.text)("Gap"),children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("div",{children:"Hi, I am the first child of this Box!"}),"\n",(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("div",{children:"Hi, I am the second child of this Box!"})]})})})]})}}};const __WEBPACK_DEFAULT_EXPORT__=componentMeta,__namedExportsOrder=["defaultStory"]},"./src/components/Box/index.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});var styled_components__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/styled-components/dist/styled-components.browser.esm.js");const __WEBPACK_DEFAULT_EXPORT__=styled_components__WEBPACK_IMPORTED_MODULE_0__.ZP.div`
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
`},"./node_modules/memoizerific sync recursive":module=>{function webpackEmptyContext(req){var e=new Error("Cannot find module '"+req+"'");throw e.code="MODULE_NOT_FOUND",e}webpackEmptyContext.keys=()=>[],webpackEmptyContext.resolve=webpackEmptyContext,webpackEmptyContext.id="./node_modules/memoizerific sync recursive",module.exports=webpackEmptyContext}}]);
//# sourceMappingURL=components-Box-Box-stories-mdx.7098e252.iframe.bundle.js.map
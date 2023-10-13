"use strict";(self.webpackChunk_citizenlab_cl2_component_library=self.webpackChunk_citizenlab_cl2_component_library||[]).push([[480],{"./node_modules/@mdx-js/react/lib/index.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{NF:()=>withMDXComponents,Zo:()=>MDXProvider,ah:()=>useMDXComponents,pC:()=>MDXContext});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js");const MDXContext=react__WEBPACK_IMPORTED_MODULE_0__.createContext({});function withMDXComponents(Component){return function boundMDXComponent(props){const allComponents=useMDXComponents(props.components);return react__WEBPACK_IMPORTED_MODULE_0__.createElement(Component,{...props,allComponents})}}function useMDXComponents(components){const contextComponents=react__WEBPACK_IMPORTED_MODULE_0__.useContext(MDXContext);return react__WEBPACK_IMPORTED_MODULE_0__.useMemo((()=>"function"==typeof components?components(contextComponents):{...contextComponents,...components}),[contextComponents,components])}const emptyObject={};function MDXProvider({components,children,disableParentContext}){let allComponents;return allComponents=disableParentContext?"function"==typeof components?components({}):components||emptyObject:useMDXComponents(components),react__WEBPACK_IMPORTED_MODULE_0__.createElement(MDXContext.Provider,{value:allComponents},children)}},"./node_modules/@storybook/addon-docs/dist/blocks.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{$4:()=>_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__.$4,Xz:()=>_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__.Xz,h_:()=>_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__.h_,oG:()=>_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__.oG});var _storybook_client_logger__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("@storybook/client-logger"),_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/@storybook/blocks/dist/index.mjs");(0,_storybook_client_logger__WEBPACK_IMPORTED_MODULE_0__.deprecate)("Import from '@storybook/addon-docs/blocks' is deprecated. Please import from '@storybook/blocks' instead.")},"./src/design/colors/Colors.stories.mdx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{default:()=>Colors_stories,defaultStory:()=>defaultStory});__webpack_require__("./node_modules/react/index.js");var lib=__webpack_require__("./node_modules/@mdx-js/react/lib/index.js"),blocks=__webpack_require__("./node_modules/@storybook/addon-docs/dist/blocks.mjs"),styled_components_browser_esm=__webpack_require__("./node_modules/styled-components/dist/styled-components.browser.esm.js"),styleUtils=__webpack_require__("./src/utils/styleUtils.ts"),Title=__webpack_require__("./src/components/Title/index.tsx"),jsx_runtime=__webpack_require__("./node_modules/react/jsx-runtime.js");const Container=styled_components_browser_esm.ZP.div`
  width: 500px;
  line-height: normal;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  padding-right: 10px;
  margin: 20px;
  border-radius: ${props=>props.theme.borderRadius};
  border: ${props=>"2px solid "+props.borderColor};
`,Color=styled_components_browser_esm.ZP.div`
  min-height: 60px;
  min-width: 120px;
  background: ${props=>props.backgroundColor};
`,ColorText=styled_components_browser_esm.ZP.div`
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`,ColorTextKey=styled_components_browser_esm.ZP.div`
  font-weight: 500;
  font-size: ${styleUtils.CH.xl}px;
`,ColorTextValue=styled_components_browser_esm.ZP.p`
  font-weight: 400;
  font-size: ${styleUtils.CH.xs}px;
`,colors=()=>(0,jsx_runtime.jsxs)(jsx_runtime.Fragment,{children:[(0,jsx_runtime.jsx)(Title.Z,{children:" Semantic colors"}),Object.entries(styleUtils.iK).sort().map((([key,value])=>(0,jsx_runtime.jsxs)(Container,{borderColor:value,children:[(0,jsx_runtime.jsx)(Color,{backgroundColor:value}),(0,jsx_runtime.jsxs)(ColorText,{children:[(0,jsx_runtime.jsx)(ColorTextKey,{children:key}),(0,jsx_runtime.jsx)(ColorTextValue,{children:value})]})]},key))),(0,jsx_runtime.jsx)(Title.Z,{children:" Theme colors"}),Object.entries(styleUtils.lB).sort().map((([key,value])=>(0,jsx_runtime.jsxs)(Container,{borderColor:value,children:[(0,jsx_runtime.jsx)(Color,{backgroundColor:value}),(0,jsx_runtime.jsxs)(ColorText,{children:[(0,jsx_runtime.jsx)(ColorTextKey,{children:key}),(0,jsx_runtime.jsx)(ColorTextValue,{children:value})]})]},key)))]});const defaultStory=()=>(0,jsx_runtime.jsx)(colors,{});defaultStory.storyName="default",defaultStory.parameters={storySource:{source:"<Colors />"}};const componentMeta={title:"Design/Colors",tags:["stories-mdx"],includeStories:["defaultStory"]};componentMeta.parameters=componentMeta.parameters||{},componentMeta.parameters.docs={...componentMeta.parameters.docs||{},page:function MDXContent(props={}){const{wrapper:MDXLayout}=Object.assign({},(0,lib.ah)(),props.components);return MDXLayout?(0,jsx_runtime.jsx)(MDXLayout,{...props,children:(0,jsx_runtime.jsx)(_createMdxContent,{})}):_createMdxContent();function _createMdxContent(){const _components=Object.assign({h1:"h1"},(0,lib.ah)(),props.components);return(0,jsx_runtime.jsxs)(jsx_runtime.Fragment,{children:[(0,jsx_runtime.jsx)(blocks.h_,{title:"Design/Colors"}),"\n",(0,jsx_runtime.jsx)(_components.h1,{id:"colors",children:"Colors"}),"\n",(0,jsx_runtime.jsx)(blocks.Xz,{children:(0,jsx_runtime.jsx)(blocks.oG,{name:"default",children:(0,jsx_runtime.jsx)(colors,{})})})]})}}};const Colors_stories=componentMeta},"./src/components/Box/index.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});var styled_components__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/styled-components/dist/styled-components.browser.esm.js");const Box=styled_components__WEBPACK_IMPORTED_MODULE_0__.ZP.div`
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
`,__WEBPACK_DEFAULT_EXPORT__=Box;try{Box.displayName="Box",Box.__docgenInfo={description:"",displayName:"Box",props:{background:{defaultValue:null,description:"",name:"background",required:!1,type:{name:"string | undefined"}},margin:{defaultValue:null,description:"",name:"margin",required:!1,type:{name:"string | undefined"}},m:{defaultValue:null,description:"",name:"m",required:!1,type:{name:"string | undefined"}},marginLeft:{defaultValue:null,description:"",name:"marginLeft",required:!1,type:{name:"string | undefined"}},ml:{defaultValue:null,description:"",name:"ml",required:!1,type:{name:"string | undefined"}},marginRight:{defaultValue:null,description:"",name:"marginRight",required:!1,type:{name:"string | undefined"}},mr:{defaultValue:null,description:"",name:"mr",required:!1,type:{name:"string | undefined"}},marginTop:{defaultValue:null,description:"",name:"marginTop",required:!1,type:{name:"string | undefined"}},mt:{defaultValue:null,description:"",name:"mt",required:!1,type:{name:"string | undefined"}},marginBottom:{defaultValue:null,description:"",name:"marginBottom",required:!1,type:{name:"string | undefined"}},mb:{defaultValue:null,description:"",name:"mb",required:!1,type:{name:"string | undefined"}},marginX:{defaultValue:null,description:"",name:"marginX",required:!1,type:{name:"string | undefined"}},mx:{defaultValue:null,description:"",name:"mx",required:!1,type:{name:"string | undefined"}},marginY:{defaultValue:null,description:"",name:"marginY",required:!1,type:{name:"string | undefined"}},my:{defaultValue:null,description:"",name:"my",required:!1,type:{name:"string | undefined"}},padding:{defaultValue:null,description:"",name:"padding",required:!1,type:{name:"string | undefined"}},p:{defaultValue:null,description:"",name:"p",required:!1,type:{name:"string | undefined"}},paddingLeft:{defaultValue:null,description:"",name:"paddingLeft",required:!1,type:{name:"string | undefined"}},pl:{defaultValue:null,description:"",name:"pl",required:!1,type:{name:"string | undefined"}},paddingRight:{defaultValue:null,description:"",name:"paddingRight",required:!1,type:{name:"string | undefined"}},pr:{defaultValue:null,description:"",name:"pr",required:!1,type:{name:"string | undefined"}},paddingTop:{defaultValue:null,description:"",name:"paddingTop",required:!1,type:{name:"string | undefined"}},pt:{defaultValue:null,description:"",name:"pt",required:!1,type:{name:"string | undefined"}},paddingBottom:{defaultValue:null,description:"",name:"paddingBottom",required:!1,type:{name:"string | undefined"}},pb:{defaultValue:null,description:"",name:"pb",required:!1,type:{name:"string | undefined"}},paddingX:{defaultValue:null,description:"",name:"paddingX",required:!1,type:{name:"string | undefined"}},px:{defaultValue:null,description:"",name:"px",required:!1,type:{name:"string | undefined"}},paddingY:{defaultValue:null,description:"",name:"paddingY",required:!1,type:{name:"string | undefined"}},py:{defaultValue:null,description:"",name:"py",required:!1,type:{name:"string | undefined"}},position:{defaultValue:null,description:"",name:"position",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"static"'},{value:'"relative"'},{value:'"fixed"'},{value:'"absolute"'},{value:'"sticky"'}]}},top:{defaultValue:null,description:"",name:"top",required:!1,type:{name:"string | undefined"}},bottom:{defaultValue:null,description:"",name:"bottom",required:!1,type:{name:"string | undefined"}},left:{defaultValue:null,description:"",name:"left",required:!1,type:{name:"string | undefined"}},right:{defaultValue:null,description:"",name:"right",required:!1,type:{name:"string | undefined"}},zIndex:{defaultValue:null,description:"",name:"zIndex",required:!1,type:{name:"string | undefined"}},height:{defaultValue:null,description:"",name:"height",required:!1,type:{name:"string | undefined"}},h:{defaultValue:null,description:"",name:"h",required:!1,type:{name:"string | undefined"}},maxHeight:{defaultValue:null,description:"",name:"maxHeight",required:!1,type:{name:"string | undefined"}},minHeight:{defaultValue:null,description:"",name:"minHeight",required:!1,type:{name:"string | undefined"}},width:{defaultValue:null,description:"",name:"width",required:!1,type:{name:"string | undefined"}},w:{defaultValue:null,description:"",name:"w",required:!1,type:{name:"string | undefined"}},maxWidth:{defaultValue:null,description:"",name:"maxWidth",required:!1,type:{name:"string | undefined"}},minWidth:{defaultValue:null,description:"",name:"minWidth",required:!1,type:{name:"string | undefined"}},display:{defaultValue:null,description:"",name:"display",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"inherit"'},{value:'"block"'},{value:'"inline-block"'},{value:'"inline"'},{value:'"flex"'},{value:'"inline-flex"'},{value:'"none"'}]}},overflow:{defaultValue:null,description:"",name:"overflow",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"hidden"'},{value:'"initial"'},{value:'"inherit"'},{value:'"visible"'},{value:'"scroll"'},{value:'"auto"'}]}},overflowX:{defaultValue:null,description:"",name:"overflowX",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"hidden"'},{value:'"initial"'},{value:'"inherit"'},{value:'"visible"'},{value:'"scroll"'},{value:'"auto"'}]}},overflowY:{defaultValue:null,description:"",name:"overflowY",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"hidden"'},{value:'"initial"'},{value:'"inherit"'},{value:'"visible"'},{value:'"scroll"'},{value:'"auto"'}]}},visibility:{defaultValue:null,description:"",name:"visibility",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"hidden"'},{value:'"initial"'},{value:'"inherit"'},{value:'"visible"'}]}},flex:{defaultValue:null,description:"",name:"flex",required:!1,type:{name:"string | undefined"}},bgColor:{defaultValue:null,description:"",name:"bgColor",required:!1,type:{name:"string | undefined"}},opacity:{defaultValue:null,description:"",name:"opacity",required:!1,type:{name:"number | undefined"}},boxShadow:{defaultValue:null,description:"",name:"boxShadow",required:!1,type:{name:"string | undefined"}},bg:{defaultValue:null,description:"",name:"bg",required:!1,type:{name:"string | undefined"}},flexDirection:{defaultValue:null,description:"",name:"flexDirection",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"initial"'},{value:'"inherit"'},{value:'"row"'},{value:'"row-reverse"'},{value:'"column"'},{value:'"column-reverse"'}]}},flexWrap:{defaultValue:null,description:"",name:"flexWrap",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"initial"'},{value:'"inherit"'},{value:'"nowrap"'},{value:'"wrap"'},{value:'"wrap-reverse"'}]}},alignItems:{defaultValue:null,description:"",name:"alignItems",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"center"'},{value:'"initial"'},{value:'"inherit"'},{value:'"flex-start"'},{value:'"flex-end"'},{value:'"baseline"'},{value:'"stretch"'}]}},justifyContent:{defaultValue:null,description:"",name:"justifyContent",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"center"'},{value:'"initial"'},{value:'"inherit"'},{value:'"flex-start"'},{value:'"flex-end"'},{value:'"space-between"'},{value:'"space-around"'},{value:'"space-evenly"'}]}},alignContent:{defaultValue:null,description:"",name:"alignContent",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"center"'},{value:'"initial"'},{value:'"inherit"'},{value:'"flex-start"'},{value:'"flex-end"'},{value:'"space-between"'},{value:'"space-around"'},{value:'"space-evenly"'}]}},order:{defaultValue:null,description:"",name:"order",required:!1,type:{name:"number | undefined"}},flexGrow:{defaultValue:null,description:"",name:"flexGrow",required:!1,type:{name:"number | undefined"}},flexShrink:{defaultValue:null,description:"",name:"flexShrink",required:!1,type:{name:"number | undefined"}},flexBasis:{defaultValue:null,description:"",name:"flexBasis",required:!1,type:{name:"number | undefined"}},alignSelf:{defaultValue:null,description:"",name:"alignSelf",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"center"'},{value:'"initial"'},{value:'"inherit"'},{value:'"auto"'},{value:'"flex-start"'},{value:'"flex-end"'},{value:'"baseline"'},{value:'"stretch"'}]}},gap:{defaultValue:null,description:"",name:"gap",required:!1,type:{name:"string | undefined"}},border:{defaultValue:null,description:"",name:"border",required:!1,type:{name:"string | undefined"}},borderTop:{defaultValue:null,description:"",name:"borderTop",required:!1,type:{name:"string | undefined"}},borderBottom:{defaultValue:null,description:"",name:"borderBottom",required:!1,type:{name:"string | undefined"}},borderLeft:{defaultValue:null,description:"",name:"borderLeft",required:!1,type:{name:"string | undefined"}},borderRight:{defaultValue:null,description:"",name:"borderRight",required:!1,type:{name:"string | undefined"}},borderColor:{defaultValue:null,description:"",name:"borderColor",required:!1,type:{name:"string | undefined"}},borderWidth:{defaultValue:null,description:"",name:"borderWidth",required:!1,type:{name:"string | undefined"}},borderRadius:{defaultValue:null,description:"",name:"borderRadius",required:!1,type:{name:"string | undefined"}},borderStyle:{defaultValue:null,description:"",name:"borderStyle",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"hidden"'},{value:'"initial"'},{value:'"none"'},{value:'"dotted"'},{value:'"dashed"'},{value:'"solid"'},{value:'"double"'},{value:'"groove"'},{value:'"ridge"'},{value:'"inset"'},{value:'"outset"'}]}},ref:{defaultValue:null,description:"",name:"ref",required:!1,type:{name:"((instance: HTMLDivElement | null) => void) | RefObject<HTMLDivElement> | null | undefined"}},theme:{defaultValue:null,description:"",name:"theme",required:!1,type:{name:"any"}},as:{defaultValue:null,description:"",name:"as",required:!1,type:{name:"undefined"}},forwardedAs:{defaultValue:null,description:"",name:"forwardedAs",required:!1,type:{name:"undefined"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/Box/index.tsx#Box"]={docgenInfo:Box.__docgenInfo,name:"Box",path:"src/components/Box/index.tsx#Box"})}catch(__react_docgen_typescript_loader_error){}},"./src/components/Title/index.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("./node_modules/react/index.js");var styled_components__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/styled-components/dist/styled-components.browser.esm.js"),_utils_styleUtils__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./src/utils/styleUtils.ts"),_Box__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./src/components/Box/index.tsx"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/react/jsx-runtime.js");const StyledTitle=(0,styled_components__WEBPACK_IMPORTED_MODULE_4__.ZP)(_Box__WEBPACK_IMPORTED_MODULE_2__.Z)`
  line-height: 1.3;

  ${_utils_styleUtils__WEBPACK_IMPORTED_MODULE_1__.t6`direction: rtl;`}

  ${({variant,color,fontSize,fontWeight,fontStyle,textAlign})=>styled_components__WEBPACK_IMPORTED_MODULE_4__.iv`
    color: ${({theme})=>color?theme.colors[color]:_utils_styleUtils__WEBPACK_IMPORTED_MODULE_1__.O9.textPrimary};
    font-weight: ${fontWeight||"bold"};
    font-style: ${fontStyle||"normal"};

    ${textAlign?`text-align: ${textAlign};`:""}
    ${"h1"===variant?`\n          font-size: ${fontSize?_utils_styleUtils__WEBPACK_IMPORTED_MODULE_1__.CH[fontSize]:_utils_styleUtils__WEBPACK_IMPORTED_MODULE_1__.CH.xxxl}px;\n        `:""}
    ${"h2"===variant?`\n          font-size: ${fontSize?_utils_styleUtils__WEBPACK_IMPORTED_MODULE_1__.CH[fontSize]:_utils_styleUtils__WEBPACK_IMPORTED_MODULE_1__.CH.xxl}px;\n        `:""}
    ${"h3"===variant?`\n          font-size: ${fontSize?_utils_styleUtils__WEBPACK_IMPORTED_MODULE_1__.CH[fontSize]:_utils_styleUtils__WEBPACK_IMPORTED_MODULE_1__.CH.xl}px;\n        `:""}
    ${"h4"===variant?`\n          font-size: ${fontSize?_utils_styleUtils__WEBPACK_IMPORTED_MODULE_1__.CH[fontSize]:_utils_styleUtils__WEBPACK_IMPORTED_MODULE_1__.CH.l}px;\n        `:""}
    ${"h5"===variant?`\n          font-size: ${fontSize?_utils_styleUtils__WEBPACK_IMPORTED_MODULE_1__.CH[fontSize]:_utils_styleUtils__WEBPACK_IMPORTED_MODULE_1__.CH.m}px;\n        `:""}
    ${"h6"===variant?`\n          font-size: ${fontSize?_utils_styleUtils__WEBPACK_IMPORTED_MODULE_1__.CH[fontSize]:_utils_styleUtils__WEBPACK_IMPORTED_MODULE_1__.CH.s}px;\n        `:""}
  `}
`,Title=({children,variant="h1",color,as,fontSize,fontWeight,...props})=>{const mb=props.mb||props.my||props.m||"16px";return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(StyledTitle,{variant,color,as:as||variant,fontSize,fontWeight,mb,...props,children})};Title.displayName="Title";const __WEBPACK_DEFAULT_EXPORT__=Title;try{Title.displayName="Title",Title.__docgenInfo={description:"",displayName:"Title",props:{variant:{defaultValue:{value:"h1"},description:"",name:"variant",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"h1"'},{value:'"h2"'},{value:'"h3"'},{value:'"h4"'},{value:'"h5"'},{value:'"h6"'}]}},color:{defaultValue:null,description:"",name:"color",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"disabled"'},{value:'"black"'},{value:'"white"'},{value:'"grey800"'},{value:'"grey700"'},{value:'"grey600"'},{value:'"grey500"'},{value:'"grey400"'},{value:'"grey300"'},{value:'"grey200"'},{value:'"grey100"'},{value:'"grey50"'},{value:'"coolGrey700"'},{value:'"coolGrey600"'},{value:'"coolGrey500"'},{value:'"coolGrey300"'},{value:'"blue700"'},{value:'"blue500"'},{value:'"blue400"'},{value:'"teal700"'},{value:'"teal500"'},{value:'"teal400"'},{value:'"teal300"'},{value:'"teal200"'},{value:'"teal100"'},{value:'"teal50"'},{value:'"red100"'},{value:'"red400"'},{value:'"red500"'},{value:'"red600"'},{value:'"red800"'},{value:'"green700"'},{value:'"green500"'},{value:'"green400"'},{value:'"green100"'},{value:'"orange"'},{value:'"brown"'},{value:'"textPrimary"'},{value:'"borderDark"'},{value:'"placeholder"'},{value:'"borderLight"'},{value:'"divider"'},{value:'"textSecondary"'},{value:'"primary"'},{value:'"teal"'},{value:'"tealLight"'},{value:'"error"'},{value:'"errorLight"'},{value:'"success"'},{value:'"successLight"'},{value:'"background"'},{value:'"twitter"'},{value:'"facebook"'},{value:'"facebookMessenger"'},{value:'"tenantPrimary"'},{value:'"tenantSecondary"'},{value:'"tenantText"'}]}},fontSize:{defaultValue:null,description:"",name:"fontSize",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"m"'},{value:'"xs"'},{value:'"s"'},{value:'"base"'},{value:'"l"'},{value:'"xl"'},{value:'"xxl"'},{value:'"xxxl"'},{value:'"xxxxl"'},{value:'"xxxxxl"'}]}},as:{defaultValue:null,description:"",name:"as",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"h1"'},{value:'"h2"'},{value:'"h3"'},{value:'"h4"'},{value:'"h5"'},{value:'"h6"'}]}},fontWeight:{defaultValue:null,description:"",name:"fontWeight",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"bold"'},{value:'"normal"'}]}},fontStyle:{defaultValue:null,description:"",name:"fontStyle",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"normal"'},{value:'"italic"'}]}},textAlign:{defaultValue:null,description:"",name:"textAlign",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"left"'},{value:'"right"'},{value:'"center"'},{value:'"justify"'},{value:'"initial"'},{value:'"inherit"'}]}},margin:{defaultValue:null,description:"",name:"margin",required:!1,type:{name:"string | undefined"}},m:{defaultValue:null,description:"",name:"m",required:!1,type:{name:"string | undefined"}},marginLeft:{defaultValue:null,description:"",name:"marginLeft",required:!1,type:{name:"string | undefined"}},ml:{defaultValue:null,description:"",name:"ml",required:!1,type:{name:"string | undefined"}},marginRight:{defaultValue:null,description:"",name:"marginRight",required:!1,type:{name:"string | undefined"}},mr:{defaultValue:null,description:"",name:"mr",required:!1,type:{name:"string | undefined"}},marginTop:{defaultValue:null,description:"",name:"marginTop",required:!1,type:{name:"string | undefined"}},mt:{defaultValue:null,description:"",name:"mt",required:!1,type:{name:"string | undefined"}},marginBottom:{defaultValue:null,description:"",name:"marginBottom",required:!1,type:{name:"string | undefined"}},mb:{defaultValue:null,description:"",name:"mb",required:!1,type:{name:"string | undefined"}},marginX:{defaultValue:null,description:"",name:"marginX",required:!1,type:{name:"string | undefined"}},mx:{defaultValue:null,description:"",name:"mx",required:!1,type:{name:"string | undefined"}},marginY:{defaultValue:null,description:"",name:"marginY",required:!1,type:{name:"string | undefined"}},my:{defaultValue:null,description:"",name:"my",required:!1,type:{name:"string | undefined"}},padding:{defaultValue:null,description:"",name:"padding",required:!1,type:{name:"string | undefined"}},p:{defaultValue:null,description:"",name:"p",required:!1,type:{name:"string | undefined"}},paddingLeft:{defaultValue:null,description:"",name:"paddingLeft",required:!1,type:{name:"string | undefined"}},pl:{defaultValue:null,description:"",name:"pl",required:!1,type:{name:"string | undefined"}},paddingRight:{defaultValue:null,description:"",name:"paddingRight",required:!1,type:{name:"string | undefined"}},pr:{defaultValue:null,description:"",name:"pr",required:!1,type:{name:"string | undefined"}},paddingTop:{defaultValue:null,description:"",name:"paddingTop",required:!1,type:{name:"string | undefined"}},pt:{defaultValue:null,description:"",name:"pt",required:!1,type:{name:"string | undefined"}},paddingBottom:{defaultValue:null,description:"",name:"paddingBottom",required:!1,type:{name:"string | undefined"}},pb:{defaultValue:null,description:"",name:"pb",required:!1,type:{name:"string | undefined"}},paddingX:{defaultValue:null,description:"",name:"paddingX",required:!1,type:{name:"string | undefined"}},px:{defaultValue:null,description:"",name:"px",required:!1,type:{name:"string | undefined"}},paddingY:{defaultValue:null,description:"",name:"paddingY",required:!1,type:{name:"string | undefined"}},py:{defaultValue:null,description:"",name:"py",required:!1,type:{name:"string | undefined"}},position:{defaultValue:null,description:"",name:"position",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"static"'},{value:'"relative"'},{value:'"fixed"'},{value:'"absolute"'},{value:'"sticky"'}]}},top:{defaultValue:null,description:"",name:"top",required:!1,type:{name:"string | undefined"}},bottom:{defaultValue:null,description:"",name:"bottom",required:!1,type:{name:"string | undefined"}},left:{defaultValue:null,description:"",name:"left",required:!1,type:{name:"string | undefined"}},right:{defaultValue:null,description:"",name:"right",required:!1,type:{name:"string | undefined"}},zIndex:{defaultValue:null,description:"",name:"zIndex",required:!1,type:{name:"string | undefined"}},height:{defaultValue:null,description:"",name:"height",required:!1,type:{name:"string | undefined"}},h:{defaultValue:null,description:"",name:"h",required:!1,type:{name:"string | undefined"}},maxHeight:{defaultValue:null,description:"",name:"maxHeight",required:!1,type:{name:"string | undefined"}},minHeight:{defaultValue:null,description:"",name:"minHeight",required:!1,type:{name:"string | undefined"}},width:{defaultValue:null,description:"",name:"width",required:!1,type:{name:"string | undefined"}},w:{defaultValue:null,description:"",name:"w",required:!1,type:{name:"string | undefined"}},maxWidth:{defaultValue:null,description:"",name:"maxWidth",required:!1,type:{name:"string | undefined"}},minWidth:{defaultValue:null,description:"",name:"minWidth",required:!1,type:{name:"string | undefined"}},display:{defaultValue:null,description:"",name:"display",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"inherit"'},{value:'"block"'},{value:'"inline-block"'},{value:'"inline"'},{value:'"flex"'},{value:'"inline-flex"'},{value:'"none"'}]}},overflow:{defaultValue:null,description:"",name:"overflow",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"hidden"'},{value:'"initial"'},{value:'"inherit"'},{value:'"visible"'},{value:'"scroll"'},{value:'"auto"'}]}},overflowX:{defaultValue:null,description:"",name:"overflowX",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"hidden"'},{value:'"initial"'},{value:'"inherit"'},{value:'"visible"'},{value:'"scroll"'},{value:'"auto"'}]}},overflowY:{defaultValue:null,description:"",name:"overflowY",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"hidden"'},{value:'"initial"'},{value:'"inherit"'},{value:'"visible"'},{value:'"scroll"'},{value:'"auto"'}]}},visibility:{defaultValue:null,description:"",name:"visibility",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"hidden"'},{value:'"initial"'},{value:'"inherit"'},{value:'"visible"'}]}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/Title/index.tsx#Title"]={docgenInfo:Title.__docgenInfo,name:"Title",path:"src/components/Title/index.tsx#Title"})}catch(__react_docgen_typescript_loader_error){}}}]);
//# sourceMappingURL=design-colors-Colors-stories-mdx.682d382f.iframe.bundle.js.map
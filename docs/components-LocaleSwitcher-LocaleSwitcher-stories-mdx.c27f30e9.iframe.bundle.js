(self.webpackChunk_citizenlab_cl2_component_library=self.webpackChunk_citizenlab_cl2_component_library||[]).push([[930],{"./node_modules/@mdx-js/react/lib/index.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{NF:()=>withMDXComponents,Zo:()=>MDXProvider,ah:()=>useMDXComponents,pC:()=>MDXContext});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js");const MDXContext=react__WEBPACK_IMPORTED_MODULE_0__.createContext({});function withMDXComponents(Component){return function boundMDXComponent(props){const allComponents=useMDXComponents(props.components);return react__WEBPACK_IMPORTED_MODULE_0__.createElement(Component,{...props,allComponents})}}function useMDXComponents(components){const contextComponents=react__WEBPACK_IMPORTED_MODULE_0__.useContext(MDXContext);return react__WEBPACK_IMPORTED_MODULE_0__.useMemo((()=>"function"==typeof components?components(contextComponents):{...contextComponents,...components}),[contextComponents,components])}const emptyObject={};function MDXProvider({components,children,disableParentContext}){let allComponents;return allComponents=disableParentContext?"function"==typeof components?components({}):components||emptyObject:useMDXComponents(components),react__WEBPACK_IMPORTED_MODULE_0__.createElement(MDXContext.Provider,{value:allComponents},children)}},"./node_modules/@storybook/addon-actions/dist/index.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{aD:()=>chunk_AY7I2SME.aD});var chunk_AY7I2SME=__webpack_require__("./node_modules/@storybook/addon-actions/dist/chunk-AY7I2SME.mjs")},"./node_modules/@storybook/addon-docs/dist/blocks.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{$4:()=>_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__.$4,Xz:()=>_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__.Xz,h_:()=>_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__.h_,oG:()=>_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__.oG});var _storybook_client_logger__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("@storybook/client-logger"),_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/@storybook/blocks/dist/index.mjs");(0,_storybook_client_logger__WEBPACK_IMPORTED_MODULE_0__.deprecate)("Import from '@storybook/addon-docs/blocks' is deprecated. Please import from '@storybook/blocks' instead.")},"./node_modules/@storybook/addon-docs/dist/chunk-HLWAVYOI.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{r:()=>DocsRenderer});var react=__webpack_require__("./node_modules/react/index.js"),react_dom=__webpack_require__("./node_modules/react-dom/index.js"),dist=__webpack_require__("./node_modules/@storybook/blocks/dist/index.mjs"),defaultComponents={code:dist.bD,a:dist.Ct,...dist.lO},ErrorBoundary=class extends react.Component{constructor(){super(...arguments),this.state={hasError:!1}}static getDerivedStateFromError(){return{hasError:!0}}componentDidCatch(err){let{showException}=this.props;showException(err)}render(){let{hasError}=this.state,{children}=this.props;return hasError?null:react.createElement(react.Fragment,null,children)}},DocsRenderer=class{constructor(){this.render=async(context,docsParameter,element)=>{let components={...defaultComponents,...docsParameter?.components},TDocs=dist.WI;return new Promise(((resolve,reject)=>{__webpack_require__.e(433).then(__webpack_require__.bind(__webpack_require__,"./node_modules/@mdx-js/react/index.js")).then((({MDXProvider})=>(async(node,el)=>new Promise((resolve=>{react_dom.render(node,el,(()=>resolve(null)))})))(react.createElement(ErrorBoundary,{showException:reject,key:Math.random()},react.createElement(MDXProvider,{components},react.createElement(TDocs,{context,docsParameter}))),element))).then((()=>resolve()))}))},this.unmount=element=>{var el;el=element,react_dom.unmountComponentAtNode(el)}}}},"./node_modules/@storybook/addon-docs/dist/index.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{$4:()=>_storybook_blocks__WEBPACK_IMPORTED_MODULE_1__.$4});__webpack_require__("./node_modules/@storybook/addon-docs/dist/chunk-HLWAVYOI.mjs");var _storybook_blocks__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/@storybook/blocks/dist/index.mjs")},"./src/components/LocaleSwitcher/LocaleSwitcher.stories.mdx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{__namedExportsOrder:()=>__namedExportsOrder,default:()=>LocaleSwitcher_stories,defaultStory:()=>defaultStory,withANoneEmptyValue:()=>withANoneEmptyValue});var react=__webpack_require__("./node_modules/react/index.js"),lib=__webpack_require__("./node_modules/@mdx-js/react/lib/index.js"),blocks=__webpack_require__("./node_modules/@storybook/addon-docs/dist/blocks.mjs"),dist=__webpack_require__("./node_modules/@storybook/addon-docs/dist/index.mjs"),addon_actions_dist=(__webpack_require__("./node_modules/@storybook/addon-knobs/dist/index.js"),__webpack_require__("./node_modules/@storybook/addon-actions/dist/index.mjs")),isEmpty=__webpack_require__("./node_modules/lodash-es/isEmpty.js"),get=__webpack_require__("./node_modules/lodash-es/get.js"),styled_components_browser_esm=__webpack_require__("./node_modules/styled-components/dist/styled-components.browser.esm.js"),polished_esm=__webpack_require__("./node_modules/polished/dist/polished.esm.js"),styleUtils=__webpack_require__("./src/utils/styleUtils.ts"),Box=__webpack_require__("./src/components/Box/index.tsx"),jsx_runtime=__webpack_require__("./node_modules/react/jsx-runtime.js");const Container=(0,styled_components_browser_esm.ZP)(Box.Z)`
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
`,isSingleMultilocObjectFilled=(locale,values)=>Object.getOwnPropertyNames(values).every((key=>!(0,isEmpty.Z)((0,get.Z)(values,`[${key}][${locale}]`)))),isValueForLocaleFilled=(locale,values)=>Array.isArray(values)?values.every((value=>isSingleMultilocObjectFilled(locale,value))):isSingleMultilocObjectFilled(locale,values);class LocaleSwitcher extends react.PureComponent{removeFocus=event=>{event.preventDefault()};handleOnClick=locale=>event=>{event.preventDefault(),this.props.selectedLocale!==locale&&this.props.onSelectedLocaleChange(locale)};render(){const{locales,selectedLocale,values,className}=this.props;return locales&&locales.length>1?(0,jsx_runtime.jsx)(Container,{className,children:locales.map(((locale,index)=>(0,jsx_runtime.jsxs)(StyledButton,{onMouseDown:this.removeFocus,onClick:this.handleOnClick(locale),type:"button",className:["e2e-localeswitcher",locale,locale===selectedLocale?"selected":"",index+1===locales.length?"last":""].join(" "),children:[values&&(0,jsx_runtime.jsx)(Dot,{className:isValueForLocaleFilled(locale,values)?"notEmpty":"empty"}),locale]},locale)))}):null}}LocaleSwitcher.displayName="LocaleSwitcher";const components_LocaleSwitcher=LocaleSwitcher;try{LocaleSwitcher.displayName="LocaleSwitcher",LocaleSwitcher.__docgenInfo={description:"",displayName:"LocaleSwitcher",props:{onSelectedLocaleChange:{defaultValue:null,description:"",name:"onSelectedLocaleChange",required:!0,type:{name:"(selectedLocale: string) => void"}},locales:{defaultValue:null,description:"",name:"locales",required:!0,type:{name:"string[]"}},selectedLocale:{defaultValue:null,description:"",name:"selectedLocale",required:!0,type:{name:"string"}},values:{defaultValue:null,description:"",name:"values",required:!1,type:{name:"MultilocFormValues | MultilocFormValues[] | undefined"}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string | undefined"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/LocaleSwitcher/index.tsx#LocaleSwitcher"]={docgenInfo:LocaleSwitcher.__docgenInfo,name:"LocaleSwitcher",path:"src/components/LocaleSwitcher/index.tsx#LocaleSwitcher"})}catch(__react_docgen_typescript_loader_error){}const defaultStory=()=>(0,jsx_runtime.jsx)("div",{style:{maxWidth:"150px"},children:(0,jsx_runtime.jsx)(components_LocaleSwitcher,{onSelectedLocaleChange:(0,addon_actions_dist.aD)("selected locale changed"),locales:["en-GB","nl-BE"],selectedLocale:"en-GB",values:{bleh:{"en-GB":"","nl-BE":""}}})});defaultStory.storyName="default",defaultStory.parameters={storySource:{source:'<div style={{\n  maxWidth: "150px"\n}}><LocaleSwitcher onSelectedLocaleChange={action("selected locale changed")} locales={["en-GB", "nl-BE"]} selectedLocale="en-GB" values={{\n    bleh: {\n      "en-GB": "",\n      "nl-BE": ""\n    }\n  }} /></div>'}};const withANoneEmptyValue=()=>(0,jsx_runtime.jsx)("div",{style:{maxWidth:"150px"},children:(0,jsx_runtime.jsx)(components_LocaleSwitcher,{onSelectedLocaleChange:(0,addon_actions_dist.aD)("selected locale changed"),locales:["en-GB","nl-BE"],selectedLocale:"en-GB",values:{bleh:{"en-GB":"","nl-BE":"Een willekeurige waarde"}}})});withANoneEmptyValue.storyName="with a none-empty value",withANoneEmptyValue.parameters={storySource:{source:'<div style={{\n  maxWidth: "150px"\n}}><LocaleSwitcher onSelectedLocaleChange={action("selected locale changed")} locales={["en-GB", "nl-BE"]} selectedLocale="en-GB" values={{\n    bleh: {\n      "en-GB": "",\n      "nl-BE": "Een willekeurige waarde"\n    }\n  }} /></div>'}};const componentMeta={title:"Components/LocaleSwitcher",component:components_LocaleSwitcher,tags:["stories-mdx"],includeStories:["defaultStory","withANoneEmptyValue"]};componentMeta.parameters=componentMeta.parameters||{},componentMeta.parameters.docs={...componentMeta.parameters.docs||{},page:function MDXContent(props={}){const{wrapper:MDXLayout}=Object.assign({},(0,lib.ah)(),props.components);return MDXLayout?(0,jsx_runtime.jsx)(MDXLayout,{...props,children:(0,jsx_runtime.jsx)(_createMdxContent,{})}):_createMdxContent();function _createMdxContent(){const _components=Object.assign({h1:"h1"},(0,lib.ah)(),props.components);return(0,jsx_runtime.jsxs)(jsx_runtime.Fragment,{children:[(0,jsx_runtime.jsx)(blocks.h_,{title:"Components/LocaleSwitcher",component:components_LocaleSwitcher}),"\n",(0,jsx_runtime.jsx)(_components.h1,{id:"localeswitcher",children:"LocaleSwitcher"}),"\n",(0,jsx_runtime.jsx)(dist.$4,{of:components_LocaleSwitcher}),"\n",(0,jsx_runtime.jsx)(blocks.Xz,{children:(0,jsx_runtime.jsx)(blocks.oG,{name:"default",children:(0,jsx_runtime.jsx)("div",{style:{maxWidth:"150px"},children:(0,jsx_runtime.jsx)(components_LocaleSwitcher,{onSelectedLocaleChange:(0,addon_actions_dist.aD)("selected locale changed"),locales:["en-GB","nl-BE"],selectedLocale:"en-GB",values:{bleh:{"en-GB":"","nl-BE":""}}})})})}),"\n",(0,jsx_runtime.jsx)(blocks.Xz,{children:(0,jsx_runtime.jsx)(blocks.oG,{name:"with a none-empty value",children:(0,jsx_runtime.jsx)("div",{style:{maxWidth:"150px"},children:(0,jsx_runtime.jsx)(components_LocaleSwitcher,{onSelectedLocaleChange:(0,addon_actions_dist.aD)("selected locale changed"),locales:["en-GB","nl-BE"],selectedLocale:"en-GB",values:{bleh:{"en-GB":"","nl-BE":"Een willekeurige waarde"}}})})})})]})}}};const LocaleSwitcher_stories=componentMeta,__namedExportsOrder=["defaultStory","withANoneEmptyValue"]},"./src/components/Box/index.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});var styled_components__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/styled-components/dist/styled-components.browser.esm.js");const __WEBPACK_DEFAULT_EXPORT__=styled_components__WEBPACK_IMPORTED_MODULE_0__.ZP.div`
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
`},"./node_modules/lodash-es/_baseKeys.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{Z:()=>_baseKeys});var _isPrototype=__webpack_require__("./node_modules/lodash-es/_isPrototype.js");const _nativeKeys=(0,__webpack_require__("./node_modules/lodash-es/_overArg.js").Z)(Object.keys,Object);var _baseKeys_hasOwnProperty=Object.prototype.hasOwnProperty;const _baseKeys=function baseKeys(object){if(!(0,_isPrototype.Z)(object))return _nativeKeys(object);var result=[];for(var key in Object(object))_baseKeys_hasOwnProperty.call(object,key)&&"constructor"!=key&&result.push(key);return result}},"./node_modules/lodash-es/_getTag.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{Z:()=>_getTag});var _getNative=__webpack_require__("./node_modules/lodash-es/_getNative.js"),_root=__webpack_require__("./node_modules/lodash-es/_root.js");const _DataView=(0,_getNative.Z)(_root.Z,"DataView");var _Map=__webpack_require__("./node_modules/lodash-es/_Map.js");const _Promise=(0,_getNative.Z)(_root.Z,"Promise");const _Set=(0,_getNative.Z)(_root.Z,"Set");const _WeakMap=(0,_getNative.Z)(_root.Z,"WeakMap");var _baseGetTag=__webpack_require__("./node_modules/lodash-es/_baseGetTag.js"),_toSource=__webpack_require__("./node_modules/lodash-es/_toSource.js"),dataViewCtorString=(0,_toSource.Z)(_DataView),mapCtorString=(0,_toSource.Z)(_Map.Z),promiseCtorString=(0,_toSource.Z)(_Promise),setCtorString=(0,_toSource.Z)(_Set),weakMapCtorString=(0,_toSource.Z)(_WeakMap),getTag=_baseGetTag.Z;(_DataView&&"[object DataView]"!=getTag(new _DataView(new ArrayBuffer(1)))||_Map.Z&&"[object Map]"!=getTag(new _Map.Z)||_Promise&&"[object Promise]"!=getTag(_Promise.resolve())||_Set&&"[object Set]"!=getTag(new _Set)||_WeakMap&&"[object WeakMap]"!=getTag(new _WeakMap))&&(getTag=function(value){var result=(0,_baseGetTag.Z)(value),Ctor="[object Object]"==result?value.constructor:void 0,ctorString=Ctor?(0,_toSource.Z)(Ctor):"";if(ctorString)switch(ctorString){case dataViewCtorString:return"[object DataView]";case mapCtorString:return"[object Map]";case promiseCtorString:return"[object Promise]";case setCtorString:return"[object Set]";case weakMapCtorString:return"[object WeakMap]"}return result});const _getTag=getTag},"./node_modules/lodash-es/_isPrototype.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});var objectProto=Object.prototype;const __WEBPACK_DEFAULT_EXPORT__=function isPrototype(value){var Ctor=value&&value.constructor;return value===("function"==typeof Ctor&&Ctor.prototype||objectProto)}},"./node_modules/lodash-es/_nodeUtil.js":(module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});var _freeGlobal_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/lodash-es/_freeGlobal.js");module=__webpack_require__.hmd(module);var freeExports="object"==typeof exports&&exports&&!exports.nodeType&&exports,freeModule=freeExports&&module&&!module.nodeType&&module,freeProcess=freeModule&&freeModule.exports===freeExports&&_freeGlobal_js__WEBPACK_IMPORTED_MODULE_0__.Z.process;const __WEBPACK_DEFAULT_EXPORT__=function(){try{var types=freeModule&&freeModule.require&&freeModule.require("util").types;return types||freeProcess&&freeProcess.binding&&freeProcess.binding("util")}catch(e){}}()},"./node_modules/lodash-es/_overArg.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});const __WEBPACK_DEFAULT_EXPORT__=function overArg(func,transform){return function(arg){return func(transform(arg))}}},"./node_modules/lodash-es/isArguments.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{Z:()=>lodash_es_isArguments});var _baseGetTag=__webpack_require__("./node_modules/lodash-es/_baseGetTag.js"),isObjectLike=__webpack_require__("./node_modules/lodash-es/isObjectLike.js");const _baseIsArguments=function baseIsArguments(value){return(0,isObjectLike.Z)(value)&&"[object Arguments]"==(0,_baseGetTag.Z)(value)};var objectProto=Object.prototype,isArguments_hasOwnProperty=objectProto.hasOwnProperty,propertyIsEnumerable=objectProto.propertyIsEnumerable;const lodash_es_isArguments=_baseIsArguments(function(){return arguments}())?_baseIsArguments:function(value){return(0,isObjectLike.Z)(value)&&isArguments_hasOwnProperty.call(value,"callee")&&!propertyIsEnumerable.call(value,"callee")}},"./node_modules/lodash-es/isArrayLike.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});var _isFunction_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/lodash-es/isFunction.js"),_isLength_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/lodash-es/isLength.js");const __WEBPACK_DEFAULT_EXPORT__=function isArrayLike(value){return null!=value&&(0,_isLength_js__WEBPACK_IMPORTED_MODULE_0__.Z)(value.length)&&!(0,_isFunction_js__WEBPACK_IMPORTED_MODULE_1__.Z)(value)}},"./node_modules/lodash-es/isBuffer.js":(module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{Z:()=>lodash_es_isBuffer});var _root=__webpack_require__("./node_modules/lodash-es/_root.js");const lodash_es_stubFalse=function stubFalse(){return!1};module=__webpack_require__.hmd(module);var freeExports="object"==typeof exports&&exports&&!exports.nodeType&&exports,freeModule=freeExports&&module&&!module.nodeType&&module,Buffer=freeModule&&freeModule.exports===freeExports?_root.Z.Buffer:void 0;const lodash_es_isBuffer=(Buffer?Buffer.isBuffer:void 0)||lodash_es_stubFalse},"./node_modules/lodash-es/isEmpty.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});var _baseKeys_js__WEBPACK_IMPORTED_MODULE_7__=__webpack_require__("./node_modules/lodash-es/_baseKeys.js"),_getTag_js__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/lodash-es/_getTag.js"),_isArguments_js__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/lodash-es/isArguments.js"),_isArray_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/lodash-es/isArray.js"),_isArrayLike_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/lodash-es/isArrayLike.js"),_isBuffer_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/lodash-es/isBuffer.js"),_isPrototype_js__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("./node_modules/lodash-es/_isPrototype.js"),_isTypedArray_js__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/lodash-es/isTypedArray.js"),hasOwnProperty=Object.prototype.hasOwnProperty;const __WEBPACK_DEFAULT_EXPORT__=function isEmpty(value){if(null==value)return!0;if((0,_isArrayLike_js__WEBPACK_IMPORTED_MODULE_0__.Z)(value)&&((0,_isArray_js__WEBPACK_IMPORTED_MODULE_1__.Z)(value)||"string"==typeof value||"function"==typeof value.splice||(0,_isBuffer_js__WEBPACK_IMPORTED_MODULE_2__.Z)(value)||(0,_isTypedArray_js__WEBPACK_IMPORTED_MODULE_3__.Z)(value)||(0,_isArguments_js__WEBPACK_IMPORTED_MODULE_4__.Z)(value)))return!value.length;var tag=(0,_getTag_js__WEBPACK_IMPORTED_MODULE_5__.Z)(value);if("[object Map]"==tag||"[object Set]"==tag)return!value.size;if((0,_isPrototype_js__WEBPACK_IMPORTED_MODULE_6__.Z)(value))return!(0,_baseKeys_js__WEBPACK_IMPORTED_MODULE_7__.Z)(value).length;for(var key in value)if(hasOwnProperty.call(value,key))return!1;return!0}},"./node_modules/lodash-es/isLength.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});const __WEBPACK_DEFAULT_EXPORT__=function isLength(value){return"number"==typeof value&&value>-1&&value%1==0&&value<=9007199254740991}},"./node_modules/lodash-es/isTypedArray.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{Z:()=>lodash_es_isTypedArray});var _baseGetTag=__webpack_require__("./node_modules/lodash-es/_baseGetTag.js"),isLength=__webpack_require__("./node_modules/lodash-es/isLength.js"),isObjectLike=__webpack_require__("./node_modules/lodash-es/isObjectLike.js"),typedArrayTags={};typedArrayTags["[object Float32Array]"]=typedArrayTags["[object Float64Array]"]=typedArrayTags["[object Int8Array]"]=typedArrayTags["[object Int16Array]"]=typedArrayTags["[object Int32Array]"]=typedArrayTags["[object Uint8Array]"]=typedArrayTags["[object Uint8ClampedArray]"]=typedArrayTags["[object Uint16Array]"]=typedArrayTags["[object Uint32Array]"]=!0,typedArrayTags["[object Arguments]"]=typedArrayTags["[object Array]"]=typedArrayTags["[object ArrayBuffer]"]=typedArrayTags["[object Boolean]"]=typedArrayTags["[object DataView]"]=typedArrayTags["[object Date]"]=typedArrayTags["[object Error]"]=typedArrayTags["[object Function]"]=typedArrayTags["[object Map]"]=typedArrayTags["[object Number]"]=typedArrayTags["[object Object]"]=typedArrayTags["[object RegExp]"]=typedArrayTags["[object Set]"]=typedArrayTags["[object String]"]=typedArrayTags["[object WeakMap]"]=!1;const _baseIsTypedArray=function baseIsTypedArray(value){return(0,isObjectLike.Z)(value)&&(0,isLength.Z)(value.length)&&!!typedArrayTags[(0,_baseGetTag.Z)(value)]};const _baseUnary=function baseUnary(func){return function(value){return func(value)}};var _nodeUtil=__webpack_require__("./node_modules/lodash-es/_nodeUtil.js"),nodeIsTypedArray=_nodeUtil.Z&&_nodeUtil.Z.isTypedArray;const lodash_es_isTypedArray=nodeIsTypedArray?_baseUnary(nodeIsTypedArray):_baseIsTypedArray},"./node_modules/memoizerific sync recursive":module=>{function webpackEmptyContext(req){var e=new Error("Cannot find module '"+req+"'");throw e.code="MODULE_NOT_FOUND",e}webpackEmptyContext.keys=()=>[],webpackEmptyContext.resolve=webpackEmptyContext,webpackEmptyContext.id="./node_modules/memoizerific sync recursive",module.exports=webpackEmptyContext}}]);
//# sourceMappingURL=components-LocaleSwitcher-LocaleSwitcher-stories-mdx.c27f30e9.iframe.bundle.js.map
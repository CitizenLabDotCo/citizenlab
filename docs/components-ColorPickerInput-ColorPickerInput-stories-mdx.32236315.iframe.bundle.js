"use strict";(self.webpackChunk_citizenlab_cl2_component_library=self.webpackChunk_citizenlab_cl2_component_library||[]).push([[759],{"./src/components/ColorPickerInput/ColorPickerInput.stories.mdx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{default:()=>ColorPickerInput_stories,defaultStory:()=>defaultStory,withLabelAnbdLabelTooptip:()=>withLabelAnbdLabelTooptip});var react=__webpack_require__("./node_modules/react/index.js"),lib=__webpack_require__("./node_modules/@mdx-js/react/lib/index.js"),blocks=__webpack_require__("./node_modules/@storybook/addon-docs/dist/blocks.mjs"),dist=__webpack_require__("./node_modules/@storybook/addon-docs/dist/index.mjs"),styled_components_browser_esm=__webpack_require__("./node_modules/styled-components/dist/styled-components.browser.esm.js"),styleUtils=__webpack_require__("./src/utils/styleUtils.ts"),es=__webpack_require__("./node_modules/react-color/es/index.js"),Input=__webpack_require__("./src/components/Input/index.tsx"),Label=__webpack_require__("./src/components/Label/index.tsx"),IconTooltip=__webpack_require__("./src/components/IconTooltip/index.tsx"),testEnv=__webpack_require__("./src/utils/testUtils/testEnv.ts"),jsx_runtime=__webpack_require__("./node_modules/react/jsx-runtime.js");const Container=styled_components_browser_esm.ZP.div``,InputWrapper=styled_components_browser_esm.ZP.div`
  display: flex;
  align-items: center;
  position: relative;
`,SelectedColorSquare=styled_components_browser_esm.ZP.div`
  flex: 0 0 46px;
  width: 46px;
  height: 46px;
  border: 1px solid ${styleUtils.O9.grey700};
  border-radius: ${({theme})=>theme.borderRadius};
  border-bottom-right-radius: 0px;
  border-top-right-radius: 0px;
  background: ${props=>props.color};
  cursor: pointer;
  position: absolute;
  top: 0px;
  left: 0px;
  z-index: 1;
`,SelectedColorValueInput=(0,styled_components_browser_esm.ZP)(Input.Z)`
  input {
    height: 46px;
    width: 180px;
    padding: 0px;
    padding-left: 54px;
    cursor: pointer;
    border: 1px solid ${styleUtils.O9.grey700};
  }
`,Popover=styled_components_browser_esm.ZP.div`
  position: absolute;
  top: 50px;
  left: 0px;
  z-index: 2;

  & * {
    font-family: 'Public Sans', 'Helvetica Neue', Arial, Helvetica, sans-serif !important;
  }
`,Cover=styled_components_browser_esm.ZP.div`
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
`;class ColorPickerInput extends react.PureComponent{constructor(props){super(props),this.state={opened:!1,value:props.value}}componentDidMount(){this.setState({value:this.props.value})}componentDidUpdate(prevProps){this.state.opened||prevProps.value===this.props.value||this.setState({value:this.props.value})}open=event=>{event.preventDefault(),this.setState({opened:!0})};close=event=>{event.preventDefault(),this.setState({opened:!1})};change=ColorDescription=>{const hexColor=ColorDescription.hex;this.setState({value:hexColor}),this.props.onChange(this.state.value)};render(){const{label,labelTooltipText,className,id}=this.props,{opened,value}=this.state;return(0,jsx_runtime.jsxs)(Container,{className:className||"",children:[label&&(0,jsx_runtime.jsxs)(Label.Z,{htmlFor:id,children:[(0,jsx_runtime.jsx)("span",{children:label}),labelTooltipText&&(0,jsx_runtime.jsx)(IconTooltip.Z,{content:labelTooltipText})]}),(0,jsx_runtime.jsxs)(InputWrapper,{children:[(0,jsx_runtime.jsx)(SelectedColorSquare,{"data-testid":(0,testEnv.Z)("selected-color-square"),onClick:this.open,color:value}),(0,jsx_runtime.jsx)(SelectedColorValueInput,{type:"text",id,value,onFocus:this.open}),opened&&(0,jsx_runtime.jsxs)(Popover,{"data-testid":(0,testEnv.Z)("popover"),children:[(0,jsx_runtime.jsx)(Cover,{onClick:this.close,"data-testid":(0,testEnv.Z)("cover")}),(0,jsx_runtime.jsx)(es.AI,{disableAlpha:!0,color:value,onChange:this.change,onChangeComplete:this.change})]})]})]})}}ColorPickerInput.displayName="ColorPickerInput";const components_ColorPickerInput=ColorPickerInput;try{ColorPickerInput.displayName="ColorPickerInput",ColorPickerInput.__docgenInfo={description:"",displayName:"ColorPickerInput",props:{id:{defaultValue:null,description:"",name:"id",required:!1,type:{name:"string | undefined"}},type:{defaultValue:null,description:"",name:"type",required:!0,type:{name:'"text"'}},value:{defaultValue:null,description:"",name:"value",required:!0,type:{name:"string"}},label:{defaultValue:null,description:"",name:"label",required:!1,type:{name:"string | Element | null | undefined"}},labelTooltipText:{defaultValue:null,description:"",name:"labelTooltipText",required:!1,type:{name:"string | Element | null | undefined"}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string | undefined"}},onChange:{defaultValue:null,description:"",name:"onChange",required:!0,type:{name:"(arg: string) => void"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/ColorPickerInput/index.tsx#ColorPickerInput"]={docgenInfo:ColorPickerInput.__docgenInfo,name:"ColorPickerInput",path:"src/components/ColorPickerInput/index.tsx#ColorPickerInput"})}catch(__react_docgen_typescript_loader_error){}var addon_actions_dist=__webpack_require__("./node_modules/@storybook/addon-actions/dist/index.mjs");const defaultStory=()=>(0,jsx_runtime.jsx)("div",{style:{display:"flex"},children:(0,jsx_runtime.jsx)(components_ColorPickerInput,{id:"color-picker",type:"text",value:"#000",onChange:(0,addon_actions_dist.aD)("color picked"),label:"Color picker"})});defaultStory.storyName="default",defaultStory.parameters={storySource:{source:'<div style={{\n  display: "flex"\n}}><ColorPickerInput id="color-picker" type="text" value="#000" onChange={action("color picked")} label="Color picker" /></div>'}};const withLabelAnbdLabelTooptip=()=>(0,jsx_runtime.jsx)("div",{style:{display:"flex"},children:(0,jsx_runtime.jsx)(components_ColorPickerInput,{type:"text",value:"#000",label:"This is a very long and unnecessary label",labelTooltipText:"this is a tooltip",onChange:(0,addon_actions_dist.aD)("color picked")})});withLabelAnbdLabelTooptip.storyName="with label anbd label tooptip",withLabelAnbdLabelTooptip.parameters={storySource:{source:'<div style={{\n  display: "flex"\n}}><ColorPickerInput type="text" value="#000" label="This is a very long and unnecessary label" labelTooltipText="this is a tooltip" onChange={action("color picked")} /></div>'}};const componentMeta={title:"Components/ColorPickerInput",component:components_ColorPickerInput,tags:["stories-mdx"],includeStories:["defaultStory","withLabelAnbdLabelTooptip"]};componentMeta.parameters=componentMeta.parameters||{},componentMeta.parameters.docs={...componentMeta.parameters.docs||{},page:function MDXContent(props={}){const{wrapper:MDXLayout}=Object.assign({},(0,lib.ah)(),props.components);return MDXLayout?(0,jsx_runtime.jsx)(MDXLayout,{...props,children:(0,jsx_runtime.jsx)(_createMdxContent,{})}):_createMdxContent();function _createMdxContent(){const _components=Object.assign({h1:"h1"},(0,lib.ah)(),props.components);return(0,jsx_runtime.jsxs)(jsx_runtime.Fragment,{children:[(0,jsx_runtime.jsx)(blocks.h_,{title:"Components/ColorPickerInput",component:components_ColorPickerInput}),"\n",(0,jsx_runtime.jsx)(_components.h1,{id:"colorpickerinput",children:"ColorPickerInput"}),"\n",(0,jsx_runtime.jsx)(dist.$4,{of:components_ColorPickerInput}),"\n",(0,jsx_runtime.jsx)(blocks.Xz,{children:(0,jsx_runtime.jsx)(blocks.oG,{name:"default",children:(0,jsx_runtime.jsx)("div",{style:{display:"flex"},children:(0,jsx_runtime.jsx)(components_ColorPickerInput,{id:"color-picker",type:"text",value:"#000",onChange:(0,addon_actions_dist.aD)("color picked"),label:"Color picker"})})})}),"\n",(0,jsx_runtime.jsx)(blocks.Xz,{children:(0,jsx_runtime.jsx)(blocks.oG,{name:"with label anbd label tooptip",children:(0,jsx_runtime.jsx)("div",{style:{display:"flex"},children:(0,jsx_runtime.jsx)(components_ColorPickerInput,{type:"text",value:"#000",label:"This is a very long and unnecessary label",labelTooltipText:"this is a tooltip",onChange:(0,addon_actions_dist.aD)("color picked")})})})})]})}}};const ColorPickerInput_stories=componentMeta},"./src/components/IconTooltip/index.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>__WEBPACK_DEFAULT_EXPORT__});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js"),_tippyjs_react__WEBPACK_IMPORTED_MODULE_8__=__webpack_require__("./node_modules/@tippyjs/react/dist/tippy-react.esm.js"),styled_components__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("./node_modules/styled-components/dist/styled-components.browser.esm.js"),polished__WEBPACK_IMPORTED_MODULE_7__=__webpack_require__("./node_modules/polished/dist/polished.esm.js"),_Icon__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./src/components/Icon/index.tsx"),_utils_styleUtils__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./src/utils/styleUtils.ts"),_utils_testUtils_testEnv__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./src/utils/testUtils/testEnv.ts"),_Box__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./src/components/Box/index.tsx"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/react/jsx-runtime.js");const ContentWrapper=styled_components__WEBPACK_IMPORTED_MODULE_6__.ZP.div`
  padding: 5px;

  a {
    color: ${props=>"light"===props.tippytheme?_utils_styleUtils__WEBPACK_IMPORTED_MODULE_2__.O9.primary:_utils_styleUtils__WEBPACK_IMPORTED_MODULE_2__.O9.white};
    text-decoration: underline;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-all;
    word-break: break-word;
    hyphens: auto;

    &:hover {
      color: ${props=>(0,polished__WEBPACK_IMPORTED_MODULE_7__._j)(.15,"light"===props.tippytheme?_utils_styleUtils__WEBPACK_IMPORTED_MODULE_2__.O9.primary:_utils_styleUtils__WEBPACK_IMPORTED_MODULE_2__.O9.white)};
      text-decoration: underline;
    }
  }
`,TooltipIcon=(0,styled_components__WEBPACK_IMPORTED_MODULE_6__.ZP)(_Icon__WEBPACK_IMPORTED_MODULE_1__.Z)`
  width: ${({iconSize})=>iconSize};
  height: ${({iconSize})=>iconSize};
  fill: ${({iconColor})=>iconColor||_utils_styleUtils__WEBPACK_IMPORTED_MODULE_2__.O9.textSecondary};
  cursor: pointer;
  ${({transform})=>transform?`transform: ${transform};`:""}

  &:hover {
    fill: ${({iconColor,iconHoverColor})=>iconHoverColor||(iconColor?(0,polished__WEBPACK_IMPORTED_MODULE_7__._j)(.2,iconColor):(0,polished__WEBPACK_IMPORTED_MODULE_7__._j)(.2,_utils_styleUtils__WEBPACK_IMPORTED_MODULE_2__.O9.textSecondary))};
  }
`,IconTooltip=(0,react__WEBPACK_IMPORTED_MODULE_0__.memo)((({content,icon,placement,theme,iconSize="20px",iconColor,iconHoverColor,maxTooltipWidth,iconAriaTitle,className,transform,...rest})=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_tippyjs_react__WEBPACK_IMPORTED_MODULE_8__.ZP,{interactive:!0,placement:placement||"right-end",theme:theme||"",maxWidth:maxTooltipWidth||350,content:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(ContentWrapper,{id:"tooltip-content",tippytheme:theme,children:content}),children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_Box__WEBPACK_IMPORTED_MODULE_4__.Z,{as:"button",className:`${className||""} tooltip-icon`,"aria-describedby":"tooltip-content","data-testid":(0,_utils_testUtils_testEnv__WEBPACK_IMPORTED_MODULE_3__.Z)("tooltip-icon-button"),p:"0px",type:"button",display:"flex",justifyContent:"center",alignItems:"center",...rest,children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(TooltipIcon,{name:icon||"info-solid",iconSize,iconColor,iconHoverColor,title:iconAriaTitle,transform})})}))),__WEBPACK_DEFAULT_EXPORT__=IconTooltip;try{IconTooltip.displayName="IconTooltip",IconTooltip.__docgenInfo={description:"",displayName:"IconTooltip",props:{className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string | undefined"}},content:{defaultValue:null,description:"",name:"content",required:!0,type:{name:"ReactChild"}},icon:{defaultValue:null,description:"",name:"icon",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"label"'},{value:'"twitter"'},{value:'"facebook"'},{value:'"position"'},{value:'"translate"'},{value:'"button"'},{value:'"grid"'},{value:'"group"'},{value:'"link"'},{value:'"list"'},{value:'"menu"'},{value:'"search"'},{value:'"text"'},{value:'"email"'},{value:'"page"'},{value:'"copy"'},{value:'"close"'},{value:'"upload-image"'},{value:'"upload-file"'},{value:'"alert-circle"'},{value:'"check"'},{value:'"halt"'},{value:'"arrow-right"'},{value:'"arrow-down"'},{value:'"arrow-up"'},{value:'"plus"'},{value:'"plus-circle"'},{value:'"delete"'},{value:'"edit"'},{value:'"vote-up"'},{value:'"vote-down"'},{value:'"chevron-right"'},{value:'"chevron-left"'},{value:'"chevron-up"'},{value:'"chevron-down"'},{value:'"idea"'},{value:'"sidebar-input-manager"'},{value:'"sidebar-proposals"'},{value:'"user-circle"'},{value:'"notification"'},{value:'"lock"'},{value:'"facebook-messenger"'},{value:'"microsoft-windows"'},{value:'"google"'},{value:'"hoplr"'},{value:'"comments"'},{value:'"info-outline"'},{value:'"calendar-range"'},{value:'"calendar"'},{value:'"power"'},{value:'"shield-checkered"'},{value:'"sidebar-settings"'},{value:'"send"'},{value:'"building"'},{value:'"mention"'},{value:'"dots-horizontal"'},{value:'"map"'},{value:'"gps"'},{value:'"location-simple"'},{value:'"timeline"'},{value:'"survey"'},{value:'"download"'},{value:'"user-check"'},{value:'"arrow-left"'},{value:'"shield-check"'},{value:'"sidebar-pages-menu"'},{value:'"email-2"'},{value:'"minus-circle"'},{value:'"sidebar-guide"'},{value:'"paperclip"'},{value:'"code"'},{value:'"question-bubble"'},{value:'"question-circle"'},{value:'"refresh"'},{value:'"share"'},{value:'"flash"'},{value:'"database"'},{value:'"folder-move"'},{value:'"user-data"'},{value:'"settings"'},{value:'"initiatives"'},{value:'"sidebar-folder"'},{value:'"folder-add"'},{value:'"sidebar-activity"'},{value:'"sidebar-workshops"'},{value:'"sidebar-users"'},{value:'"sidebar-dashboards"'},{value:'"chart-bar"'},{value:'"sidebar-invitations"'},{value:'"sidebar-messaging"'},{value:'"sidebar-academy"'},{value:'"money-bag"'},{value:'"home"'},{value:'"info-solid"'},{value:'"dot"'},{value:'"pen"'},{value:'"cl-favicon"'},{value:'"filter"'},{value:'"clock"'},{value:'"bullseye"'},{value:'"email-check"'},{value:'"check-circle"'},{value:'"template"'},{value:'"blank-paper"'},{value:'"participation-level"'},{value:'"key"'},{value:'"minus"'},{value:'"inbox"'},{value:'"bookmark"'},{value:'"bookmark-outline"'},{value:'"eye"'},{value:'"eye-off"'},{value:'"open-in-new"'},{value:'"file"'},{value:'"file-add"'},{value:'"folder-solid"'},{value:'"folder-outline"'},{value:'"flag"'},{value:'"user"'},{value:'"basket"'},{value:'"basket-plus"'},{value:'"basket-minus"'},{value:'"basket-checkmark"'},{value:'"volunteer"'},{value:'"volunteer-off"'},{value:'"cl-logo"'},{value:'"arrow-left-circle"'},{value:'"whatsapp"'},{value:'"sidebar-reporting"'},{value:'"alert-octagon"'},{value:'"alert-octagon-off"'},{value:'"filter-2"'},{value:'"categories"'},{value:'"token"'},{value:'"coin-stack"'},{value:'"image"'},{value:'"accordion"'},{value:'"layout-1column"'},{value:'"layout-2column-1"'},{value:'"layout-3column"'},{value:'"layout-2column-3"'},{value:'"layout-2column-2"'},{value:'"message"'},{value:'"layout-white-space"'},{value:'"section-info-accordion"'},{value:'"section-image-text"'},{value:'"tablet"'},{value:'"desktop"'},{value:'"survey-number-field"'},{value:'"sort"'},{value:'"survey-short-answer"'},{value:'"survey-long-answer"'},{value:'"survey-linear-scale"'},{value:'"survey-multiple-choice"'},{value:'"survey-long-answer-2"'},{value:'"survey-short-answer-2"'},{value:'"survey-multiple-choice-2"'},{value:'"survey-single-choice"'},{value:'"section"'},{value:'"rectangle"'},{value:'"line"'},{value:'"logic"'},{value:'"save"'},{value:'"projects"'},{value:'"messages"'},{value:'"users"'},{value:'"proposals"'},{value:'"messages-inbox"'},{value:'"dashboard"'},{value:'"help"'},{value:'"cog"'},{value:'"organigram"'},{value:'"community"'},{value:'"academy"'},{value:'"book"'},{value:'"reports"'},{value:'"notification-outline"'},{value:'"vote-ballot"'}]}},placement:{defaultValue:null,description:"",name:"placement",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"top"'},{value:'"bottom"'},{value:'"left"'},{value:'"right"'},{value:'"auto"'},{value:'"auto-start"'},{value:'"auto-end"'},{value:'"top-start"'},{value:'"top-end"'},{value:'"right-start"'},{value:'"right-end"'},{value:'"bottom-end"'},{value:'"bottom-start"'},{value:'"left-end"'},{value:'"left-start"'}]}},theme:{defaultValue:null,description:"",name:"theme",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"light"'}]}},iconSize:{defaultValue:null,description:"",name:"iconSize",required:!1,type:{name:"string | undefined"}},iconColor:{defaultValue:null,description:"",name:"iconColor",required:!1,type:{name:"string | undefined"}},iconHoverColor:{defaultValue:null,description:"",name:"iconHoverColor",required:!1,type:{name:"string | undefined"}},maxTooltipWidth:{defaultValue:null,description:"",name:"maxTooltipWidth",required:!1,type:{name:"number | undefined"}},iconAriaTitle:{defaultValue:null,description:"",name:"iconAriaTitle",required:!1,type:{name:"string | undefined"}},transform:{defaultValue:null,description:"",name:"transform",required:!1,type:{name:"string | undefined"}},position:{defaultValue:null,description:"",name:"position",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"static"'},{value:'"relative"'},{value:'"fixed"'},{value:'"absolute"'},{value:'"sticky"'}]}},top:{defaultValue:null,description:"",name:"top",required:!1,type:{name:"string | undefined"}},bottom:{defaultValue:null,description:"",name:"bottom",required:!1,type:{name:"string | undefined"}},left:{defaultValue:null,description:"",name:"left",required:!1,type:{name:"string | undefined"}},right:{defaultValue:null,description:"",name:"right",required:!1,type:{name:"string | undefined"}},margin:{defaultValue:null,description:"",name:"margin",required:!1,type:{name:"string | undefined"}},m:{defaultValue:null,description:"",name:"m",required:!1,type:{name:"string | undefined"}},marginLeft:{defaultValue:null,description:"",name:"marginLeft",required:!1,type:{name:"string | undefined"}},ml:{defaultValue:null,description:"",name:"ml",required:!1,type:{name:"string | undefined"}},marginRight:{defaultValue:null,description:"",name:"marginRight",required:!1,type:{name:"string | undefined"}},mr:{defaultValue:null,description:"",name:"mr",required:!1,type:{name:"string | undefined"}},marginTop:{defaultValue:null,description:"",name:"marginTop",required:!1,type:{name:"string | undefined"}},mt:{defaultValue:null,description:"",name:"mt",required:!1,type:{name:"string | undefined"}},marginBottom:{defaultValue:null,description:"",name:"marginBottom",required:!1,type:{name:"string | undefined"}},mb:{defaultValue:null,description:"",name:"mb",required:!1,type:{name:"string | undefined"}},marginX:{defaultValue:null,description:"",name:"marginX",required:!1,type:{name:"string | undefined"}},mx:{defaultValue:null,description:"",name:"mx",required:!1,type:{name:"string | undefined"}},marginY:{defaultValue:null,description:"",name:"marginY",required:!1,type:{name:"string | undefined"}},my:{defaultValue:null,description:"",name:"my",required:!1,type:{name:"string | undefined"}},padding:{defaultValue:null,description:"",name:"padding",required:!1,type:{name:"string | undefined"}},p:{defaultValue:null,description:"",name:"p",required:!1,type:{name:"string | undefined"}},paddingLeft:{defaultValue:null,description:"",name:"paddingLeft",required:!1,type:{name:"string | undefined"}},pl:{defaultValue:null,description:"",name:"pl",required:!1,type:{name:"string | undefined"}},paddingRight:{defaultValue:null,description:"",name:"paddingRight",required:!1,type:{name:"string | undefined"}},pr:{defaultValue:null,description:"",name:"pr",required:!1,type:{name:"string | undefined"}},paddingTop:{defaultValue:null,description:"",name:"paddingTop",required:!1,type:{name:"string | undefined"}},pt:{defaultValue:null,description:"",name:"pt",required:!1,type:{name:"string | undefined"}},paddingBottom:{defaultValue:null,description:"",name:"paddingBottom",required:!1,type:{name:"string | undefined"}},pb:{defaultValue:null,description:"",name:"pb",required:!1,type:{name:"string | undefined"}},paddingX:{defaultValue:null,description:"",name:"paddingX",required:!1,type:{name:"string | undefined"}},px:{defaultValue:null,description:"",name:"px",required:!1,type:{name:"string | undefined"}},paddingY:{defaultValue:null,description:"",name:"paddingY",required:!1,type:{name:"string | undefined"}},py:{defaultValue:null,description:"",name:"py",required:!1,type:{name:"string | undefined"}},visibility:{defaultValue:null,description:"",name:"visibility",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"hidden"'},{value:'"initial"'},{value:'"inherit"'},{value:'"visible"'}]}},display:{defaultValue:null,description:"",name:"display",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"inherit"'},{value:'"block"'},{value:'"inline-block"'},{value:'"inline"'},{value:'"flex"'},{value:'"inline-flex"'},{value:'"none"'}]}},zIndex:{defaultValue:null,description:"",name:"zIndex",required:!1,type:{name:"string | undefined"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/IconTooltip/index.tsx#IconTooltip"]={docgenInfo:IconTooltip.__docgenInfo,name:"IconTooltip",path:"src/components/IconTooltip/index.tsx#IconTooltip"})}catch(__react_docgen_typescript_loader_error){}},"./src/components/Input/index.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>components_Input});var react=__webpack_require__("./node_modules/react/index.js"),lodash_es_size=__webpack_require__("./node_modules/lodash-es/size.js"),isNil=__webpack_require__("./node_modules/lodash-es/isNil.js"),isEmpty=__webpack_require__("./node_modules/lodash-es/isEmpty.js"),isBoolean=__webpack_require__("./node_modules/lodash-es/isBoolean.js"),CSSTransition=__webpack_require__("./node_modules/react-transition-group/esm/CSSTransition.js"),styled_components_browser_esm=__webpack_require__("./node_modules/styled-components/dist/styled-components.browser.esm.js"),polished_esm=__webpack_require__("./node_modules/polished/dist/polished.esm.js"),Icon=__webpack_require__("./src/components/Icon/index.tsx"),styleUtils=__webpack_require__("./src/utils/styleUtils.ts"),jsx_runtime=__webpack_require__("./node_modules/react/jsx-runtime.js");const ErrorMessageText=styled_components_browser_esm.ZP.div`
  flex: 1 1 100%;
  color: ${styleUtils.O9.red600};
  font-size: ${styleUtils.CH.base}px;
  line-height: normal;
  font-weight: 400;

  a {
    color: ${styleUtils.O9.red600};
    font-weight: 500;
    text-decoration: underline;

    &:hover {
      color: ${(0,polished_esm._j)(.2,styleUtils.O9.red600)};
      text-decoration: underline;
    }
  }

  strong {
    font-weight: 500;
  }
`,ErrorIcon=(0,styled_components_browser_esm.ZP)(Icon.Z)`
  flex: 0 0 24px;
  fill: ${styleUtils.O9.red600};
  padding: 0px;
  margin: 0px;
  margin-right: 10px;
`,ContainerInner=styled_components_browser_esm.ZP.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 13px;
  border-radius: ${props=>props.theme.borderRadius};
  background: ${styleUtils.O9.red100};
  background: ${props=>props.showBackground?styleUtils.O9.red100:"transparent"};
`,Container=styled_components_browser_esm.ZP.div`
  position: relative;
  overflow: hidden;

  ${ContainerInner} {
    margin-top: ${props=>props.marginTop};
    margin-bottom: ${props=>props.marginBottom};
  }

  &.error-enter {
    max-height: 0px;
    opacity: 0;

    &.error-enter-active {
      max-height: 60px;
      opacity: 1;
      transition: max-height ${350}ms cubic-bezier(0.165, 0.84, 0.44, 1),
        opacity ${350}ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }

  &.error-exit {
    max-height: 100px;
    opacity: 1;

    &.error-exit-active {
      max-height: 0px;
      opacity: 0;
      transition: max-height ${350}ms cubic-bezier(0.19, 1, 0.22, 1),
        opacity ${350}ms cubic-bezier(0.19, 1, 0.22, 1);
    }
  }
`;class Error extends react.PureComponent{static defaultProps={marginTop:"3px",marginBottom:"0px",showIcon:!0,showBackground:!0,className:"",animate:!0};constructor(props){super(props),this.state={mounted:!1}}componentDidMount(){this.setState({mounted:!0})}componentWillUnmount(){this.setState({mounted:!1})}render(){const{mounted}=this.state,{text,marginTop,marginBottom,showIcon,showBackground,className,animate}=this.props;return(0,jsx_runtime.jsx)(CSSTransition.Z,{classNames:"error",in:!(!mounted||!text),timeout:350,mounOnEnter:!0,unmountOnExit:!0,enter:animate,exit:animate,children:(0,jsx_runtime.jsx)(Container,{className:`e2e-error-message ${className}`,marginTop,marginBottom,role:"alert",children:(0,jsx_runtime.jsxs)(ContainerInner,{showBackground,children:[showIcon&&(0,jsx_runtime.jsx)(ErrorIcon,{name:"alert-circle",ariaHidden:!0,fill:styleUtils.O9.error}),(0,jsx_runtime.jsx)(ErrorMessageText,{children:text&&(0,jsx_runtime.jsx)("p",{children:text})})]})})})}}Error.displayName="Error";const components_Error=Error;try{Error.displayName="Error",Error.__docgenInfo={description:"",displayName:"Error",props:{text:{defaultValue:null,description:"",name:"text",required:!1,type:{name:"string | null | undefined"}},marginTop:{defaultValue:{value:"3px"},description:"",name:"marginTop",required:!1,type:{name:"string"}},marginBottom:{defaultValue:{value:"0px"},description:"",name:"marginBottom",required:!1,type:{name:"string"}},showIcon:{defaultValue:{value:"true"},description:"",name:"showIcon",required:!1,type:{name:"boolean"}},showBackground:{defaultValue:{value:"true"},description:"",name:"showBackground",required:!1,type:{name:"boolean"}},className:{defaultValue:{value:""},description:"",name:"className",required:!1,type:{name:"string"}},animate:{defaultValue:{value:"true"},description:"",name:"animate",required:!1,type:{name:"boolean | undefined"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/Error/index.tsx#Error"]={docgenInfo:Error.__docgenInfo,name:"Error",path:"src/components/Error/index.tsx#Error"})}catch(__react_docgen_typescript_loader_error){}var Label=__webpack_require__("./src/components/Label/index.tsx"),IconTooltip=__webpack_require__("./src/components/IconTooltip/index.tsx");styled_components_browser_esm.ZP.label`
  span:first-child {
    ${(0,polished_esm.G0)()}
  }
`,styled_components_browser_esm.ZP.fieldset`
  border: none;
`;const ScreenReaderOnly=styled_components_browser_esm.ZP.span`
  ${(0,styleUtils.Nf)()}
`,Input_Container=styled_components_browser_esm.ZP.div`
  width: 100%;
  position: relative;

  input {
    width: 100%;

    &.hasMaxCharCount {
      padding-right: 62px;
    }
    ${styleUtils.t6`
      &.hasMaxCharCount {
          padding-right: ${styleUtils.jF.inputPadding};
          padding-left: 62px;
      }`}
    ${styleUtils.ZL};
  }
`,CharCount=styled_components_browser_esm.ZP.div`
  color: ${styleUtils.O9.textSecondary};
  font-size: ${styleUtils.CH.s}px;
  font-weight: 400;
  text-align: right;
  position: absolute;
  bottom: ${({inputSize})=>"small"===inputSize?"10px":"14px"};
  right: 10px;

  ${styleUtils.t6`
    left: 10px;
    right: auto;
  `}

  &.error {
    color: red;
  }
`;class Input extends react.PureComponent{handleOnChange=event=>{const{maxCharCount,onChange,locale}=this.props;(!maxCharCount||(0,lodash_es_size.Z)(event.currentTarget.value)<=maxCharCount)&&onChange&&onChange(event.currentTarget.value,locale)};handleOnBlur=event=>{const{onBlur}=this.props;onBlur&&onBlur(event)};handleRef=element=>{this.props.setRef&&this.props.setRef(element)};render(){const{label,labelTooltipText,ariaLabel,a11yCharactersLeftMessage,className}=this.props,{id,type,name,maxCharCount,min,max,autoFocus,onFocus,disabled,spellCheck,readOnly,required,autocomplete,size="medium","data-testid":dataTestId}=this.props,hasError=!(0,isNil.Z)(this.props.error)&&!(0,isEmpty.Z)(this.props.error),optionalProps=(0,isBoolean.Z)(spellCheck)?{spellCheck}:null,value=(0,isNil.Z)(this.props.value)?"":this.props.value,placeholder=this.props.placeholder||"",error=this.props.error||null,currentCharCount=maxCharCount&&(0,lodash_es_size.Z)(value),tooManyChars=!!(maxCharCount&&currentCharCount&&currentCharCount>maxCharCount);return(0,jsx_runtime.jsxs)(Input_Container,{className:className||"",size,"data-testid":dataTestId,children:[label&&(0,jsx_runtime.jsxs)(Label.Z,{htmlFor:id,children:[(0,jsx_runtime.jsx)("span",{children:label}),labelTooltipText&&(0,jsx_runtime.jsx)(IconTooltip.Z,{content:labelTooltipText})]}),(0,jsx_runtime.jsx)("input",{"aria-label":ariaLabel,id,className:`\n            ${maxCharCount&&"hasMaxCharCount"}\n            ${hasError?"error":""}\n          `,name,type,placeholder,value,onChange:this.handleOnChange,onFocus,onBlur:this.handleOnBlur,ref:this.handleRef,min,max,autoFocus,disabled,readOnly,required,autoComplete:autocomplete,...optionalProps}),maxCharCount&&(0,jsx_runtime.jsxs)(jsx_runtime.Fragment,{children:[a11yCharactersLeftMessage&&(0,jsx_runtime.jsx)(ScreenReaderOnly,{"aria-live":"polite",children:a11yCharactersLeftMessage}),(0,jsx_runtime.jsxs)(CharCount,{className:`${tooManyChars&&"error"}`,"aria-hidden":!0,inputSize:size,children:[currentCharCount,"/",maxCharCount]})]}),(0,jsx_runtime.jsx)(components_Error,{className:"e2e-input-error",text:error})]})}}Input.displayName="Input";const components_Input=Input;try{Input.displayName="Input",Input.__docgenInfo={description:"",displayName:"Input",props:{ariaLabel:{defaultValue:null,description:"",name:"ariaLabel",required:!1,type:{name:"string | undefined"}},id:{defaultValue:null,description:"",name:"id",required:!1,type:{name:"string | undefined"}},label:{defaultValue:null,description:"",name:"label",required:!1,type:{name:"string | Element | null | undefined"}},labelTooltipText:{defaultValue:null,description:"",name:"labelTooltipText",required:!1,type:{name:"string | Element | null | undefined"}},value:{defaultValue:null,description:"",name:"value",required:!1,type:{name:"string | null | undefined"}},locale:{defaultValue:null,description:"",name:"locale",required:!1,type:{name:"string | undefined"}},type:{defaultValue:null,description:"",name:"type",required:!0,type:{name:"enum",value:[{value:'"number"'},{value:'"text"'},{value:'"email"'},{value:'"date"'},{value:'"password"'}]}},placeholder:{defaultValue:null,description:"",name:"placeholder",required:!1,type:{name:"string | null | undefined"}},error:{defaultValue:null,description:"",name:"error",required:!1,type:{name:"string | null | undefined"}},onChange:{defaultValue:null,description:"",name:"onChange",required:!1,type:{name:"((arg: string, locale: string | undefined) => void) | undefined"}},onFocus:{defaultValue:null,description:"",name:"onFocus",required:!1,type:{name:"((arg: FormEvent<HTMLInputElement>) => void) | undefined"}},onBlur:{defaultValue:null,description:"",name:"onBlur",required:!1,type:{name:"((arg: FormEvent<HTMLInputElement>) => void) | undefined"}},setRef:{defaultValue:null,description:"",name:"setRef",required:!1,type:{name:"((arg: HTMLInputElement) => void | undefined) | undefined"}},autoFocus:{defaultValue:null,description:"",name:"autoFocus",required:!1,type:{name:"boolean | undefined"}},min:{defaultValue:null,description:"",name:"min",required:!1,type:{name:"string | undefined"}},max:{defaultValue:null,description:"",name:"max",required:!1,type:{name:"string | undefined"}},name:{defaultValue:null,description:"",name:"name",required:!1,type:{name:"string | undefined"}},maxCharCount:{defaultValue:null,description:"",name:"maxCharCount",required:!1,type:{name:"number | undefined"}},disabled:{defaultValue:null,description:"",name:"disabled",required:!1,type:{name:"boolean | undefined"}},spellCheck:{defaultValue:null,description:"",name:"spellCheck",required:!1,type:{name:"boolean | undefined"}},readOnly:{defaultValue:null,description:"",name:"readOnly",required:!1,type:{name:"boolean | undefined"}},required:{defaultValue:null,description:"",name:"required",required:!1,type:{name:"boolean | undefined"}},autocomplete:{defaultValue:null,description:"",name:"autocomplete",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"on"'},{value:'"off"'},{value:'"email"'},{value:'"given-name"'},{value:'"family-name"'},{value:'"current-password"'},{value:'"new-password"'}]}},a11yCharactersLeftMessage:{defaultValue:null,description:"",name:"a11yCharactersLeftMessage",required:!1,type:{name:"string | undefined"}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string | undefined"}},size:{defaultValue:null,description:"",name:"size",required:!1,type:{name:"enum",value:[{value:"undefined"},{value:'"small"'},{value:'"medium"'}]}},"data-testid":{defaultValue:null,description:"",name:"data-testid",required:!1,type:{name:"string | undefined"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/Input/index.tsx#Input"]={docgenInfo:Input.__docgenInfo,name:"Input",path:"src/components/Input/index.tsx#Input"})}catch(__react_docgen_typescript_loader_error){}},"./src/components/Label/index.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>Label});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js"),styled_components__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/styled-components/dist/styled-components.browser.esm.js"),_utils_styleUtils__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./src/utils/styleUtils.ts"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/react/jsx-runtime.js");const Container=styled_components__WEBPACK_IMPORTED_MODULE_3__.ZP.label`
  color: ${_utils_styleUtils__WEBPACK_IMPORTED_MODULE_1__.O9.textSecondary};
  display: flex;
  align-items: center;
  font-size: ${_utils_styleUtils__WEBPACK_IMPORTED_MODULE_1__.CH.base}px;
  font-weight: 400;
  line-height: normal;
  margin: 0;
  padding: 0;
  margin-bottom: 10px;

  & > :not(last-child) {
    margin-right: 4px;
  }

  & .tooltip-icon {
    margin-left: 6px;
  }

  &.invisible {
    ${_utils_styleUtils__WEBPACK_IMPORTED_MODULE_1__.Nf}
  }
`;class Label extends react__WEBPACK_IMPORTED_MODULE_0__.PureComponent{handleOnClick=event=>{this.props.onClick&&this.props.onClick(event)};render(){const{value,htmlFor,children,id,className,hidden}=this.props;return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(Container,{id,className:`${className||""} ${hidden?"invisible":""}`,htmlFor,onClick:this.handleOnClick,children:children||value})}}Label.displayName="Label";try{Label.displayName="Label",Label.__docgenInfo={description:"",displayName:"Label",props:{id:{defaultValue:null,description:"",name:"id",required:!1,type:{name:"string | undefined"}},value:{defaultValue:null,description:"",name:"value",required:!1,type:{name:"string | Element | undefined"}},htmlFor:{defaultValue:null,description:"",name:"htmlFor",required:!1,type:{name:"string | undefined"}},hidden:{defaultValue:null,description:"",name:"hidden",required:!1,type:{name:"boolean | undefined"}},className:{defaultValue:null,description:"",name:"className",required:!1,type:{name:"string | undefined"}},onClick:{defaultValue:null,description:"",name:"onClick",required:!1,type:{name:"((event: MouseEvent<Element, MouseEvent>) => void) | undefined"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/Label/index.tsx#Label"]={docgenInfo:Label.__docgenInfo,name:"Label",path:"src/components/Label/index.tsx#Label"})}catch(__react_docgen_typescript_loader_error){}},"./src/utils/testUtils/testEnv.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>testEnv});__webpack_require__("./node_modules/process/browser.js");function testEnv(input){0}}}]);
//# sourceMappingURL=components-ColorPickerInput-ColorPickerInput-stories-mdx.32236315.iframe.bundle.js.map
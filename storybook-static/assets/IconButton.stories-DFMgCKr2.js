import{n as e}from"./chunk-BneVvdWh.js";import{n as t,t as n}from"./utils-CL72_TDw.js";import{t as r}from"./jsx-runtime-B6lWK8m9.js";import{a as i,i as a,o,s,t as c}from"./lucide-react-B06CBWml.js";function l({onClick:e,children:t,className:r,title:i,ariaLabel:a,ariaHasPopup:o,ariaExpanded:s}){return(0,u.jsx)(`button`,{type:`button`,onClick:e,title:i,"aria-label":a,"aria-haspopup":o,"aria-expanded":o?s:void 0,className:n(`dt-icon-btn transition-colors`,r),children:t})}var u,d=e((()=>{t(),u=r(),l.__docgenInfo={description:``,methods:[],displayName:`IconButton`,props:{onClick:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:``},children:{required:!0,tsType:{name:`ReactNode`},description:``},className:{required:!1,tsType:{name:`string`},description:``},title:{required:!1,tsType:{name:`string`},description:``},ariaLabel:{required:!0,tsType:{name:`string`},description:``},ariaHasPopup:{required:!1,tsType:{name:`union`,raw:`'menu' | 'listbox' | 'dialog' | 'tree' | 'grid' | 'true'`,elements:[{name:`literal`,value:`'menu'`},{name:`literal`,value:`'listbox'`},{name:`literal`,value:`'dialog'`},{name:`literal`,value:`'tree'`},{name:`literal`,value:`'grid'`},{name:`literal`,value:`'true'`}]},description:`Set when the button toggles a popover/menu so screen readers announce expanded state.`},ariaExpanded:{required:!1,tsType:{name:`boolean`},description:``}}}})),f,p,m,h,g,_,v,y;e((()=>{c(),d(),f=r(),p={component:l,tags:[`autodocs`],argTypes:{onClick:{action:`clicked`},ariaHasPopup:{control:`select`,options:[void 0,`menu`,`listbox`,`dialog`]}}},m={args:{ariaLabel:`Settings`,children:(0,f.jsx)(i,{size:16})}},h={args:{ariaLabel:`More options`,ariaHasPopup:`menu`,ariaExpanded:!1,title:`More options`,children:(0,f.jsx)(s,{size:16})}},g={args:{ariaLabel:`More options`,ariaHasPopup:`menu`,ariaExpanded:!0,title:`More options`,children:(0,f.jsx)(s,{size:16})}},_={args:{ariaLabel:`Delete rule`,title:`Delete rule`,children:(0,f.jsx)(a,{size:16})}},v={args:{ariaLabel:`Add rule`,title:`Add rule`,children:(0,f.jsx)(o,{size:16})}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    ariaLabel: 'Settings',
    children: <Settings2Icon size={16} />
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    ariaLabel: 'More options',
    ariaHasPopup: 'menu',
    ariaExpanded: false,
    title: 'More options',
    children: <EllipsisIcon size={16} />
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    ariaLabel: 'More options',
    ariaHasPopup: 'menu',
    ariaExpanded: true,
    title: 'More options',
    children: <EllipsisIcon size={16} />
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    ariaLabel: 'Delete rule',
    title: 'Delete rule',
    children: <Trash2Icon size={16} />
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    ariaLabel: 'Add rule',
    title: 'Add rule',
    children: <PlusIcon size={16} />
  }
}`,...v.parameters?.docs?.source}}},y=[`Default`,`WithMenu`,`WithMenuExpanded`,`Destructive`,`Add`]}))();export{v as Add,m as Default,_ as Destructive,h as WithMenu,g as WithMenuExpanded,y as __namedExportsOrder,p as default};
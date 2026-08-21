import{a as e,n as t}from"./chunk-BneVvdWh.js";import{t as n}from"./iframe-BU-ug8M9.js";import{n as r,t as i}from"./utils-CL72_TDw.js";import{t as a}from"./jsx-runtime-B6lWK8m9.js";function o({checked:e,indeterminate:t,onChange:n,className:r}){let a=(0,s.useRef)(null);return(0,s.useEffect)(()=>{a.current&&(a.current.indeterminate=!!t)},[t]),(0,c.jsx)(`input`,{ref:a,type:`checkbox`,checked:e,onChange:e=>n(e.target.checked),className:i(`rounded cursor-pointer`,r)})}var s,c,l=t((()=>{s=e(n(),1),r(),c=a(),o.__docgenInfo={description:``,methods:[],displayName:`Checkbox`,props:{checked:{required:!0,tsType:{name:`boolean`},description:``},indeterminate:{required:!1,tsType:{name:`boolean`},description:``},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(checked: boolean) => void`,signature:{arguments:[{type:{name:`boolean`},name:`checked`}],return:{name:`void`}}},description:``},className:{required:!1,tsType:{name:`string`},description:``}}}})),u,d,f,p,m,h;t((()=>{l(),{fn:u}=__STORYBOOK_MODULE_TEST__,d={component:o,tags:[`autodocs`],argTypes:{onChange:{action:`changed`}}},f={args:{checked:!1,onChange:u()}},p={args:{checked:!0,onChange:u()}},m={args:{checked:!1,indeterminate:!0,onChange:u()}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    checked: false,
    onChange: fn()
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    checked: true,
    onChange: fn()
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    checked: false,
    indeterminate: true,
    onChange: fn()
  }
}`,...m.parameters?.docs?.source}}},h=[`Unchecked`,`Checked`,`Indeterminate`]}))();export{p as Checked,m as Indeterminate,f as Unchecked,h as __namedExportsOrder,d as default};
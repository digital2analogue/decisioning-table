import{a as e,n as t}from"./chunk-BneVvdWh.js";import{t as n}from"./iframe-BU-ug8M9.js";import{n as r,t as i}from"./utils-CL72_TDw.js";import{t as a}from"./jsx-runtime-B6lWK8m9.js";function o({value:e,onChange:t,error:n}){let[r,a]=(0,s.useState)(!1),o=e===null?``:r?String(e):e.toLocaleString();return(0,c.jsxs)(`div`,{className:i(`dt-amount-cell`,n&&`dt-cell-error`),children:[(0,c.jsx)(`span`,{className:`dt-amount-prefix`,"aria-hidden":`true`,children:`$`}),(0,c.jsx)(`input`,{type:r?`number`:`text`,value:o,placeholder:`Amount`,onChange:e=>{let n=e.target.value.replace(/,/g,``).trim();t(n===``?null:Number(n))},onFocus:()=>a(!0),onBlur:()=>a(!1),"aria-invalid":n||void 0,className:`dt-amount-input`})]})}var s,c,l=t((()=>{s=e(n(),1),r(),c=a(),o.__docgenInfo={description:``,methods:[],displayName:`AmountCell`,props:{value:{required:!0,tsType:{name:`union`,raw:`number | null`,elements:[{name:`number`},{name:`null`}]},description:`null renders the input empty (placeholder only).`},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(next: number | null) => void`,signature:{arguments:[{type:{name:`union`,raw:`number | null`,elements:[{name:`number`},{name:`null`}]},name:`next`}],return:{name:`void`}}},description:``},error:{required:!1,tsType:{name:`boolean`},description:``}}}})),u,d,f,p,m,h,g,_;t((()=>{l(),u=a(),{fn:d}=__STORYBOOK_MODULE_TEST__,f={component:o,tags:[`autodocs`],argTypes:{onChange:{action:`changed`}},decorators:[e=>(0,u.jsx)(`div`,{style:{width:160},children:(0,u.jsx)(e,{})})]},p={args:{value:null,onChange:d()}},m={args:{value:5e4,onChange:d()}},h={args:{value:125e4,onChange:d()}},g={args:{value:null,error:!0,onChange:d()}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    value: null,
    onChange: fn()
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    value: 50000,
    onChange: fn()
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    value: 1250000,
    onChange: fn()
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    value: null,
    error: true,
    onChange: fn()
  }
}`,...g.parameters?.docs?.source}}},_=[`Empty`,`Filled`,`LargeAmount`,`Error`]}))();export{p as Empty,g as Error,m as Filled,h as LargeAmount,_ as __namedExportsOrder,f as default};
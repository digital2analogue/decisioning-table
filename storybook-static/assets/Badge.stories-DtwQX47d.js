import{a as e,n as t}from"./chunk-BneVvdWh.js";import{t as n}from"./iframe-BU-ug8M9.js";import{t as r}from"./jsx-runtime-B6lWK8m9.js";import{c as i,l as a,n as o,t as s}from"./lucide-react-B06CBWml.js";import{n as c,t as l}from"./Picker-B6LA_aUV.js";function u({value:e,onChange:t,error:n}){return(0,f.jsx)(l,{value:e,onChange:t,options:p,placeholder:`Select attribute`,triggerVariant:`badge`,ariaLabel:`Data attribute`,error:n,renderTrigger:({label:e})=>(0,f.jsxs)(f.Fragment,{children:[e,(0,f.jsx)(i,{size:12,className:`dt-select-chevron`})]})})}function d({value:e,onChange:t}){return(0,f.jsxs)(`div`,{className:`dt-outcome-seg`,role:`radiogroup`,"aria-label":`Outcome`,children:[e!==null&&(0,f.jsx)(`span`,{className:`dt-outcome-seg-indicator${e===`Deny`?` dt-outcome-seg-indicator-right`:``}`,"aria-hidden":`true`}),(0,f.jsxs)(`button`,{type:`button`,role:`radio`,"aria-checked":e===`Approve`,onClick:()=>t(`Approve`),className:`dt-outcome-seg-btn${e===`Approve`?` dt-outcome-seg-approve`:``}`,children:[(0,f.jsx)(a,{size:12,className:`dt-outcome-seg-icon`,"aria-hidden":`true`}),(0,f.jsx)(`span`,{children:`Approve`})]}),(0,f.jsxs)(`button`,{type:`button`,role:`radio`,"aria-checked":e===`Deny`,onClick:()=>t(`Deny`),className:`dt-outcome-seg-btn${e===`Deny`?` dt-outcome-seg-deny`:``}`,children:[(0,f.jsx)(o,{size:12,className:`dt-outcome-seg-icon`,"aria-hidden":`true`}),(0,f.jsx)(`span`,{children:`Deny`})]})]})}var f,p,m=t((()=>{s(),c(),f=r(),p=[{value:`Income`,label:`Income`,leadingDotClass:`dt-attr-dot-income`},{value:`Expense`,label:`Expense`,leadingDotClass:`dt-attr-dot-expense`},{value:`Asset`,label:`Asset`,leadingDotClass:`dt-attr-dot-asset`},{value:`Liability`,label:`Liability`,leadingDotClass:`dt-attr-dot-liability`}],u.__docgenInfo={description:``,methods:[],displayName:`AttributeSelectBadge`,props:{value:{required:!0,tsType:{name:`union`,raw:`DataAttribute | null`,elements:[{name:`union`,raw:`'Income' | 'Expense' | 'Asset' | 'Liability'`,elements:[{name:`literal`,value:`'Income'`},{name:`literal`,value:`'Expense'`},{name:`literal`,value:`'Asset'`},{name:`literal`,value:`'Liability'`}]},{name:`null`}]},description:``},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(v: DataAttribute) => void`,signature:{arguments:[{type:{name:`union`,raw:`'Income' | 'Expense' | 'Asset' | 'Liability'`,elements:[{name:`literal`,value:`'Income'`},{name:`literal`,value:`'Expense'`},{name:`literal`,value:`'Asset'`},{name:`literal`,value:`'Liability'`}]},name:`v`}],return:{name:`void`}}},description:``},error:{required:!1,tsType:{name:`boolean`},description:``}}},d.__docgenInfo={description:``,methods:[],displayName:`OutcomeBadge`,props:{value:{required:!0,tsType:{name:`union`,raw:`Outcome | null`,elements:[{name:`union`,raw:`'Approve' | 'Deny'`,elements:[{name:`literal`,value:`'Approve'`},{name:`literal`,value:`'Deny'`}]},{name:`null`}]},description:`null renders as a no-selection state where neither segment is active.`},onChange:{required:!0,tsType:{name:`signature`,type:`function`,raw:`(v: Outcome) => void`,signature:{arguments:[{type:{name:`union`,raw:`'Approve' | 'Deny'`,elements:[{name:`literal`,value:`'Approve'`},{name:`literal`,value:`'Deny'`}]},name:`v`}],return:{name:`void`}}},description:``}}}})),h,g,_,v,y,b,x,S,C,w,T,E;t((()=>{h=e(n(),1),m(),g=r(),{fn:_}=__STORYBOOK_MODULE_TEST__,v={component:u,tags:[`autodocs`],argTypes:{onChange:{action:`changed`},value:{control:`select`,options:[null,`Income`,`Expense`,`Asset`,`Liability`]}}},y={name:`AttributeSelectBadge / Empty`,args:{value:null,onChange:_()}},b={name:`AttributeSelectBadge / Filled`,args:{value:`Income`,onChange:_()}},x={name:`AttributeSelectBadge / Error`,args:{value:null,error:!0,onChange:_()}},S={name:`AttributeSelectBadge / Interactive`,render:()=>{let[e,t]=(0,h.useState)(null);return(0,g.jsx)(u,{value:e,onChange:t})}},C={name:`OutcomeBadge / Unselected`,render:()=>{let[e,t]=(0,h.useState)(null);return(0,g.jsx)(d,{value:e,onChange:t})}},w={name:`OutcomeBadge / Approve`,render:()=>{let[e,t]=(0,h.useState)(`Approve`);return(0,g.jsx)(d,{value:e,onChange:t})}},T={name:`OutcomeBadge / Deny`,render:()=>{let[e,t]=(0,h.useState)(`Deny`);return(0,g.jsx)(d,{value:e,onChange:t})}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'AttributeSelectBadge / Empty',
  args: {
    value: null,
    onChange: fn()
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'AttributeSelectBadge / Filled',
  args: {
    value: 'Income',
    onChange: fn()
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'AttributeSelectBadge / Error',
  args: {
    value: null,
    error: true,
    onChange: fn()
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'AttributeSelectBadge / Interactive',
  render: () => {
    const [value, setValue] = useState<DataAttribute | null>(null);
    return <AttributeSelectBadge value={value} onChange={setValue} />;
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'OutcomeBadge / Unselected',
  render: () => {
    const [value, setValue] = useState<Outcome | null>(null);
    return <OutcomeBadge value={value} onChange={setValue} />;
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'OutcomeBadge / Approve',
  render: () => {
    const [value, setValue] = useState<Outcome | null>('Approve');
    return <OutcomeBadge value={value} onChange={setValue} />;
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'OutcomeBadge / Deny',
  render: () => {
    const [value, setValue] = useState<Outcome | null>('Deny');
    return <OutcomeBadge value={value} onChange={setValue} />;
  }
}`,...T.parameters?.docs?.source}}},E=[`AttributeEmpty`,`AttributeFilled`,`AttributeError`,`AttributeInteractive`,`OutcomeUnselected`,`OutcomeApprove`,`OutcomeDeny`]}))();export{y as AttributeEmpty,x as AttributeError,b as AttributeFilled,S as AttributeInteractive,w as OutcomeApprove,T as OutcomeDeny,C as OutcomeUnselected,E as __namedExportsOrder,v as default};
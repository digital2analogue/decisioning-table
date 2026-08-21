import{a as e,n as t}from"./chunk-BneVvdWh.js";import{t as n}from"./iframe-BU-ug8M9.js";import{t as r}from"./jsx-runtime-B6lWK8m9.js";import{n as i,t as a}from"./Picker-B6LA_aUV.js";var o,s,c,l,u,d,f,p,m,h,g;t((()=>{o=e(n(),1),i(),s=r(),c=[{value:`>`,label:`Greater than`},{value:`>=`,label:`Greater than or equal`},{value:`<`,label:`Less than`},{value:`<=`,label:`Less than or equal`},{value:`=`,label:`Equal to`}],l=[{value:`Income`,label:`Income`,leadingDotClass:`dt-attr-dot-income`},{value:`Expense`,label:`Expense`,leadingDotClass:`dt-attr-dot-expense`},{value:`Asset`,label:`Asset`,leadingDotClass:`dt-attr-dot-asset`},{value:`Liability`,label:`Liability`,leadingDotClass:`dt-attr-dot-liability`}],u={title:`Atoms/Picker`,tags:[`autodocs`]},d={name:`select-trigger / Empty`,render:()=>{let[e,t]=(0,o.useState)(null);return(0,s.jsx)(a,{value:e,onChange:t,options:c,placeholder:`Select operator`,triggerVariant:`select-trigger`,ariaLabel:`Operator`,width:180})}},f={name:`select-trigger / Filled`,render:()=>{let[e,t]=(0,o.useState)(`>`);return(0,s.jsx)(a,{value:e,onChange:t,options:c,triggerVariant:`select-trigger`,ariaLabel:`Operator`,width:180})}},p={name:`select-trigger / Error`,render:()=>{let[e,t]=(0,o.useState)(null);return(0,s.jsx)(a,{value:e,onChange:t,options:c,placeholder:`Select operator`,triggerVariant:`select-trigger`,ariaLabel:`Operator`,error:!0,width:180})}},m={name:`badge / With dots`,render:()=>{let[e,t]=(0,o.useState)(null);return(0,s.jsx)(a,{value:e,onChange:t,options:l,placeholder:`Select attribute`,triggerVariant:`badge`,ariaLabel:`Data attribute`})}},h={name:`logic-chip`,render:()=>{let[e,t]=(0,o.useState)(`AND`);return(0,s.jsx)(a,{value:e,onChange:t,options:[{value:`AND`,label:`AND`},{value:`OR`,label:`OR`}],triggerVariant:`logic-chip`,ariaLabel:`Logic operator`})}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'select-trigger / Empty',
  render: () => {
    const [value, setValue] = useState<Operator | null>(null);
    return <Picker<Operator> value={value} onChange={setValue} options={OPERATOR_OPTIONS} placeholder="Select operator" triggerVariant="select-trigger" ariaLabel="Operator" width={180} />;
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'select-trigger / Filled',
  render: () => {
    const [value, setValue] = useState<Operator | null>('>');
    return <Picker<Operator> value={value} onChange={setValue} options={OPERATOR_OPTIONS} triggerVariant="select-trigger" ariaLabel="Operator" width={180} />;
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'select-trigger / Error',
  render: () => {
    const [value, setValue] = useState<Operator | null>(null);
    return <Picker<Operator> value={value} onChange={setValue} options={OPERATOR_OPTIONS} placeholder="Select operator" triggerVariant="select-trigger" ariaLabel="Operator" error={true} width={180} />;
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'badge / With dots',
  render: () => {
    const [value, setValue] = useState<DataAttribute | null>(null);
    return <Picker<DataAttribute> value={value} onChange={setValue} options={ATTRIBUTE_OPTIONS} placeholder="Select attribute" triggerVariant="badge" ariaLabel="Data attribute" />;
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'logic-chip',
  render: () => {
    type Logic = 'AND' | 'OR';
    const [value, setValue] = useState<Logic | null>('AND');
    return <Picker<Logic> value={value} onChange={setValue} options={[{
      value: 'AND',
      label: 'AND'
    }, {
      value: 'OR',
      label: 'OR'
    }]} triggerVariant="logic-chip" ariaLabel="Logic operator" />;
  }
}`,...h.parameters?.docs?.source}}},g=[`SelectTriggerEmpty`,`SelectTriggerFilled`,`SelectTriggerError`,`BadgeTrigger`,`LogicChip`]}))();export{m as BadgeTrigger,h as LogicChip,d as SelectTriggerEmpty,p as SelectTriggerError,f as SelectTriggerFilled,g as __namedExportsOrder,u as default};
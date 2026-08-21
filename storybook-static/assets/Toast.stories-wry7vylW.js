import{a as e,n as t}from"./chunk-BneVvdWh.js";import{t as n}from"./iframe-BU-ug8M9.js";import{t as r}from"./react-dom-DRoslc0j.js";import{t as i}from"./jsx-runtime-B6lWK8m9.js";import{n as a,t as o}from"./lucide-react-B06CBWml.js";function s({message:e,actionLabel:t,onAction:n,onDismiss:r,durationMs:i=5e3}){return(0,c.useEffect)(()=>{if(i<=0)return;let e=window.setTimeout(r,i);return()=>window.clearTimeout(e)},[i,r]),(0,l.createPortal)((0,u.jsxs)(`div`,{role:`status`,"aria-live":`polite`,className:`dt-toast`,children:[(0,u.jsx)(`span`,{className:`dt-toast-message`,children:e}),t&&n&&(0,u.jsx)(`button`,{type:`button`,onClick:()=>{n(),r()},className:`dt-toast-action`,children:t}),(0,u.jsx)(`button`,{type:`button`,onClick:r,"aria-label":`Dismiss`,className:`dt-toast-close`,children:(0,u.jsx)(a,{size:14})})]}),document.body)}var c,l,u,d=t((()=>{c=e(n(),1),l=r(),o(),u=i()})),f,p,m,h,g,_,v,y,b;t((()=>{f=e(n(),1),d(),p=i(),{fn:m}=__STORYBOOK_MODULE_TEST__,h={component:s,tags:[`autodocs`],parameters:{layout:`fullscreen`},argTypes:{onDismiss:{action:`dismissed`},onAction:{action:`action clicked`}}},g={args:{message:`Rule deleted.`,durationMs:0,onDismiss:m()}},_={args:{message:`Rule deleted.`,actionLabel:`Undo`,durationMs:0,onDismiss:m(),onAction:m()}},v={args:{message:`Changes saved.`,durationMs:3e3,onDismiss:m()}},y={render:()=>{let[e,t]=(0,f.useState)(!1);return(0,p.jsxs)(`div`,{style:{padding:32},children:[(0,p.jsx)(`button`,{type:`button`,className:`dt-btn dt-btn-primary`,onClick:()=>t(!0),children:`Delete a rule`}),e&&(0,p.jsx)(s,{message:`Rule 3 deleted.`,actionLabel:`Undo`,onAction:()=>t(!1),onDismiss:()=>t(!1),durationMs:5e3})]})}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    message: 'Rule deleted.',
    durationMs: 0,
    onDismiss: fn()
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    message: 'Rule deleted.',
    actionLabel: 'Undo',
    durationMs: 0,
    onDismiss: fn(),
    onAction: fn()
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    message: 'Changes saved.',
    durationMs: 3000,
    onDismiss: fn()
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [visible, setVisible] = useState(false);
    return <div style={{
      padding: 32
    }}>\r
        <button type="button" className="dt-btn dt-btn-primary" onClick={() => setVisible(true)}>\r
          Delete a rule\r
        </button>\r
        {visible && <Toast message="Rule 3 deleted." actionLabel="Undo" onAction={() => setVisible(false)} onDismiss={() => setVisible(false)} durationMs={5000} />}\r
      </div>;
  }
}`,...y.parameters?.docs?.source}}},b=[`MessageOnly`,`WithUndo`,`AutoDismiss`,`Interactive`]}))();export{v as AutoDismiss,y as Interactive,g as MessageOnly,_ as WithUndo,b as __namedExportsOrder,h as default};
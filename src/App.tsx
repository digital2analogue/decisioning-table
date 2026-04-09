import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DecisioningEngine } from './components/templates/DecisioningEngine'

export default function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <DecisioningEngine />
    </DndProvider>
  )
}

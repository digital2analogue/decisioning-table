import type { Preview } from '@storybook/react'
import '../src/tokens/variables.css'
import '../src/index.css'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'arctic',
      values: [
        { name: 'arctic', value: '#F5F8FC' },
        { name: 'white', value: '#ffffff' },
      ],
    },
    layout: 'centered',
  },
}

export default preview

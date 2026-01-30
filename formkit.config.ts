import { rootClasses } from './formkit.theme'
import type { DefaultConfigOptions } from '@formkit/vue'

const config: DefaultConfigOptions = {
  config: {
    rootClasses: (section, node) => {
      // Check for specific overrides based on family/type
      const type = node.props.type
      
      // SHADCN UI COMPATIBLE STYLES
      
      // 1. Text Inputs (text, email, password, url, number, etc.)
      if (['text', 'email', 'password', 'url', 'number', 'tel', 'date'].includes(type)) {
        if (section === 'label') {
          return {
            'text-sm': true,
            'font-medium': true,
            'leading-none': true,
            'peer-disabled:cursor-not-allowed': true,
            'peer-disabled:opacity-70': true,
            'mb-2': true,
            'block': true,
            'text-foreground': true // Use app foreground color
          }
        }
        if (section === 'inner') {
           return {
             'flex': true,
             'h-10': true,
             'w-full': true,
             'rounded-md': true,
             'border': true,
             'border-input': true, // Shadcn border
             'bg-background': true, // Shadcn bg
             'px-3': true,
             'py-2': true,
             'text-sm': true,
             'ring-offset-background': true, // Shadcn ring offset
             'focus-within:ring-2': true,
             'focus-within:ring-ring': true, // Shadcn ring
             'focus-within:ring-offset-2': true,
             'data-[invalid]:border-destructive': true,
             'data-[disabled]:cursor-not-allowed': true,
             'data-[disabled]:opacity-50': true,
             'text-foreground': true
           }
        }
        if (section === 'input') {
          return {
             'w-full': true,
             'h-full': true,
             'bg-transparent': true,
             'outline-none': true,
             'placeholder:text-muted-foreground': true,
             'text-foreground': true
          }
        }
      }

      // 2. Textarea
      if (type === 'textarea') {
         if (section === 'label') {
           return {
            'text-sm': true,
            'font-medium': true,
            'leading-none': true,
            'mb-2': true,
            'block': true,
            'text-foreground': true
           }
         }
         if (section === 'inner') {
            return {
              'flex': true,
              'min-h-[80px]': true,
              'w-full': true,
              'rounded-md': true,
              'border': true,
              'border-input': true,
              'bg-background': true,
              'px-3': true,
              'py-2': true,
              'text-sm': true,
              'ring-offset-background': true,
              'focus-within:ring-2': true,
              'focus-within:ring-ring': true,
              'focus-within:ring-offset-2': true,
              'data-[invalid]:border-destructive': true,
              'data-[disabled]:cursor-not-allowed': true,
              'data-[disabled]:opacity-50': true,
              'text-foreground': true
            }
         }
         if (section === 'input') {
            return {
               'w-full': true,
               'h-full': true,
               'bg-transparent': true,
               'outline-none': true,
               'placeholder:text-muted-foreground': true,
               'text-foreground': true
            }
         }
      }
      
      // 3. Select
      if (type === 'select') {
          if (section === 'label') {
             return {
              'text-sm': true,
              'font-medium': true,
              'leading-none': true,
              'mb-2': true,
              'block': true,
              'text-foreground': true
             }
          }
          if (section === 'inner') {
             return {
               'flex': true,
               'h-10': true,
               'w-full': true,
               'items-center': true,
               'justify-between': true,
               'rounded-md': true,
               'border': true,
               'border-input': true,
               'bg-background': true,
               'px-3': true,
               'py-2': true,
               'text-sm': true,
               'ring-offset-background': true,
               'focus-within:ring-2': true,
               'focus-within:ring-ring': true,
               'focus-within:ring-offset-2': true,
               'data-[disabled]:cursor-not-allowed': true,
               'data-[disabled]:opacity-50': true,
               'text-foreground': true
             }
          }
          if (section === 'input') {
             return {
                'w-full': true,
                'bg-transparent': true,
                'outline-none': true,
                'text-foreground': true
             }
          }
      }

      // 4. Buttons (Submit)
      if (type === 'submit') {
          if (section === 'input') {
            return {
              'inline-flex': true,
              'items-center': true,
              'justify-center': true,
              'rounded-md': true,
              'text-sm': true,
              'font-medium': true,
              'ring-offset-background': true,
              'transition-colors': true,
              'focus-visible:outline-none': true,
              'focus-visible:ring-2': true,
              'focus-visible:ring-ring': true,
              'focus-visible:ring-offset-2': true,
              'disabled:pointer-events-none': true,
              'disabled:opacity-50': true,
              'bg-primary': true,
              'text-primary-foreground': true,
              'hover:bg-primary/90': true,
              'h-10': true,
              'px-4': true,
              'py-2': true,
              'w-full': true // Make submit buttons full width by default in forms
            }
          }
      }

      // Common Overrides
      if (section === 'help') {
         return {
           'text-xs': true,
           'text-muted-foreground': true,
           'mt-1': true
         }
      }
      if (section === 'message') {
         return {
           'text-xs': true,
           'font-medium': true,
           'text-destructive': true,
           'mt-1': true
         }
      }
      if (section === 'wrapper') {
          return {
              'mb-4': true, // Standard spacing
          }
      }

      // Fallback to the generated theme for everything else
      return rootClasses(section, node)
    }
  }
}

export default config

import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';

export default function StyledSelect({ value, onValueChange, options, placeholder, className = '' }) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger
        className={`flex items-center justify-between w-full bg-md-surface-container-high border border-md-outline-variant rounded-xl px-3 py-3.5 text-md-on-surface text-sm focus:outline-none focus:border-md-primary focus:ring-2 focus:ring-md-primary/20 transition-all ${className}`}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon className="ml-2">
          <ChevronDown size={16} className="text-md-on-surface-variant" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="overflow-hidden rounded-xl bg-md-surface-container border border-md-outline-variant shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          position="popper"
          sideOffset={4}
        >
          <Select.Viewport className="p-1">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="flex items-center justify-between px-3 py-3 rounded-lg text-sm text-md-on-surface hover:bg-md-surface-container-high focus:bg-md-primary-container focus:text-md-on-primary-container cursor-pointer transition-colors data-[state=checked]:bg-md-primary-container data-[state=checked]:text-md-on-primary-container"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check size={16} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

import { ArrowUpDown, ChevronDown } from "../../MaterialIcons";

export function SortControl({
  ariaLabel,
  onChange,
  options,
  value,
}: {
  ariaLabel: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <div className="sort-control">
      <ArrowUpDown aria-hidden size={17} />
      <span>Ordenar</span>
      <div className="sort-select">
        <select
          aria-label={ariaLabel}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden size={16} />
      </div>
    </div>
  );
}

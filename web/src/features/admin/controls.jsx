import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const Check = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="m4 10 4 4 8-8" />
  </svg>
);

export function Checkbox({ className = "", ...props }) {
  return (
    <span className="relative mt-0.5 inline-grid h-5 w-5 shrink-0 place-items-center">
      <input
        {...props}
        type="checkbox"
        className={`peer m-0 h-5 w-5 cursor-pointer appearance-none rounded-md border border-control bg-white transition-colors checked:border-action checked:bg-action disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      />
      <span className="pointer-events-none absolute inset-0 grid place-items-center text-white opacity-0 peer-checked:opacity-100 [&_svg]:h-4 [&_svg]:w-4">
        <Check />
      </span>
    </span>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "ค้นหา",
  label = "ค้นหาทะเบียน",
}) {
  const id = useId();
  const input = useRef(null);
  return (
    <div className="relative mt-4 flex items-center">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <svg
        className="pointer-events-none absolute left-3 !h-4 !w-4 text-muted"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <circle cx="8.5" cy="8.5" r="5.5" />
        <path d="m13 13 4 4" />
      </svg>
      <input
        ref={input}
        id={id}
        type="search"
        autoComplete="off"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full appearance-none rounded-lg border border-control bg-[#fffaf4] py-2.5 pl-9 pr-10 text-[13px]"
      />
      {value && (
        <button
          type="button"
          aria-label="ล้างคำค้น"
          className="absolute right-1 grid h-9 w-9 place-items-center rounded-md text-muted hover:bg-accent-soft hover:text-action"
          onClick={() => {
            onChange({ target: { value: "" } });
            input.current?.focus();
          }}
        >
          <svg
            className="!h-4 !w-4"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="m5 5 10 10M15 5 5 15" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function TextArea({ value, ...props }) {
  const input = useRef(null);
  useLayoutEffect(() => {
    if (!input.current) return;
    input.current.style.height = "auto";
    input.current.style.height = `${Math.min(360, Math.max(112, input.current.scrollHeight))}px`;
  }, [value]);
  return <textarea {...props} ref={input} value={value} />;
}

export function Select({
  children,
  value,
  onChange,
  disabled,
  required,
  className = "",
  "aria-label": label,
  ...props
}) {
  const options = Children.toArray(children)
    .filter(isValidElement)
    .map((option) => ({
      value: String(option.props.value ?? ""),
      text: Children.toArray(option.props.children).join(""),
      disabled: Boolean(option.props.disabled),
    }));
  const selectedIndex = options.findIndex(
    (option) => option.value === String(value),
  );
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(selectedIndex);
  const [placement, setPlacement] = useState(null);
  const trigger = useRef(null);
  const popup = useRef(null);
  const search = useRef({ text: "", at: 0 });
  const id = useId();
  const selected = options[selectedIndex];
  const enabled = options
    .map((option, i) => (option.disabled ? -1 : i))
    .filter((i) => i >= 0);

  useLayoutEffect(() => {
    if (!open) return;
    const position = () => {
      const rect = trigger.current.getBoundingClientRect();
      const below = innerHeight - rect.bottom - 16;
      const above = rect.top - 16;
      const upwards = below < 180 && above > below;
      const width = Math.min(Math.max(rect.width, 208), innerWidth - 24);
      setPlacement({
        left: Math.max(12, Math.min(rect.left, innerWidth - width - 12)),
        width,
        maxHeight: Math.max(80, Math.min(304, upwards ? above : below)),
        ...(upwards
          ? { bottom: innerHeight - rect.top + 8 }
          : { top: rect.bottom + 8 }),
      });
    };
    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const outside = (event) => {
      if (
        !trigger.current?.contains(event.target) &&
        !popup.current?.contains(event.target)
      )
        setOpen(false);
    };
    document.addEventListener("pointerdown", outside, true);
    return () => document.removeEventListener("pointerdown", outside, true);
  }, [open]);
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  useEffect(() => {
    if (open)
      popup.current
        ?.querySelector('[data-active="true"]')
        ?.scrollIntoView({ block: "nearest" });
  }, [active, open, placement]);

  function expand() {
    setActive(
      selectedIndex >= 0 && !options[selectedIndex].disabled
        ? selectedIndex
        : (enabled[0] ?? -1),
    );
    setOpen(true);
  }
  function choose(index) {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange?.({
      target: { value: option.value },
      currentTarget: { value: option.value },
    });
    setOpen(false);
    trigger.current?.focus();
  }
  function keyDown(event) {
    if (disabled || event.isComposing) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (["Enter", " "].includes(event.key)) {
      event.preventDefault();
      if (open) choose(active);
      else expand();
      return;
    }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      if (!open) {
        expand();
        if (event.key === "End") setActive(enabled.at(-1) ?? -1);
        if (event.key === "Home") setActive(enabled[0] ?? -1);
        return;
      }
      if (event.key === "Home") setActive(enabled[0] ?? -1);
      else if (event.key === "End") setActive(enabled.at(-1) ?? -1);
      else {
        const next =
          enabled.indexOf(active) + (event.key === "ArrowDown" ? 1 : -1);
        setActive(enabled[(next + enabled.length) % enabled.length] ?? -1);
      }
      return;
    }
    if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      const now = Date.now();
      search.current = {
        text:
          now - search.current.at > 600
            ? event.key
            : search.current.text + event.key,
        at: now,
      };
      const found = enabled.find((i) =>
        options[i].text
          .toLocaleLowerCase()
          .startsWith(search.current.text.toLocaleLowerCase()),
      );
      if (found !== undefined) {
        setActive(found);
        setOpen(true);
      }
    }
  }
  return (
    <>
      <button
        {...props}
        ref={trigger}
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-activedescendant={
          open && active >= 0 ? `${id}-${active}` : undefined
        }
        aria-required={required || undefined}
        disabled={disabled}
        onKeyDown={keyDown}
        onClick={() => (open ? setOpen(false) : expand())}
        className={`relative !inline-flex min-h-10 w-full items-center justify-between gap-3 text-left ${className}`}
      >
        <span className="min-w-0 truncate">
          {selected?.text || "เลือกข้อมูล"}
        </span>
        <svg
          className={`!h-4 !w-4 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="m5 7 5 5 5-5" />
        </svg>
      </button>
      {open &&
        placement &&
        createPortal(
          <div
            ref={popup}
            id={id}
            role="listbox"
            aria-label={label}
            style={placement}
            className="fixed z-[1000] overflow-y-auto rounded-xl border border-line bg-white p-1.5 font-sans text-sm text-ink shadow-[0_12px_32px_rgba(0,0,0,0.08)]"
            onMouseDown={(event) => event.preventDefault()}
          >
            {options.map((option, i) => (
              <div
                key={`${option.value}-${i}`}
                id={`${id}-${i}`}
                role="option"
                aria-selected={i === selectedIndex}
                aria-disabled={option.disabled || undefined}
                data-active={i === active}
                onPointerMove={() => {
                  if (!option.disabled) setActive(i);
                }}
                onClick={() => choose(i)}
                className={`flex min-h-10 cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2 ${option.disabled ? "cursor-not-allowed text-muted opacity-50" : i === active ? "bg-accent-soft text-action" : "text-ink"} ${i === selectedIndex ? "font-medium" : ""}`}
              >
                <span>{option.text}</span>
                {i === selectedIndex && (
                  <span className="text-action [&_svg]:h-4 [&_svg]:w-4">
                    <Check />
                  </span>
                )}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

export function Form({ children, onSubmit, ...props }) {
  const [errors, setErrors] = useState([]);
  const id = useId();
  function clear(form) {
    form.querySelectorAll("[data-form-invalid]").forEach((input) => {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
      input.removeAttribute("data-form-invalid");
    });
    setErrors([]);
  }
  function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    clear(form);
    const invalid = [...form.elements].filter(
      (input) => input.willValidate && !input.validity.valid,
    );
    if (invalid.length) {
      setErrors(
        invalid.map((input) => {
          input.setAttribute("aria-invalid", "true");
          input.setAttribute("aria-describedby", id);
          input.setAttribute("data-form-invalid", "true");
          const label =
            input.labels?.[0]?.textContent
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 60) || "ข้อมูล";
          return `${label}: ${input.validity.valueMissing ? "กรุณากรอกข้อมูลให้ครบ" : input.validity.patternMismatch ? "รูปแบบข้อมูลไม่ถูกต้อง" : "กรุณาตรวจสอบข้อมูลอีกครั้ง"}`;
        }),
      );
      invalid[0].focus();
      return;
    }
    onSubmit?.(event);
  }
  return (
    <form
      {...props}
      noValidate
      onSubmit={submit}
      onInputCapture={(event) => {
        if (errors.length) clear(event.currentTarget);
      }}
    >
      {errors.length > 0 && (
        <div
          role="alert"
          id={id}
          className="my-4 rounded-xl border border-[#e2bab7] bg-[#fff2f0] p-4 text-sm text-[#9d3e38]"
        >
          <p className="font-medium">ตรวจสอบข้อมูลก่อนดำเนินการ</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {children}
    </form>
  );
}

export function Tooltip({ content, children }) {
  const [position, setPosition] = useState(null);
  const timer = useRef(null);
  const hideTimer = useRef(null);
  const id = useId();
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      clearTimeout(hideTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (!position) return;
    const escape = (event) => {
      if (event.key === "Escape") hide();
    };
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    document.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
      document.removeEventListener("keydown", escape);
    };
  }, [position]);
  function show(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    clearTimeout(timer.current);
    clearTimeout(hideTimer.current);
    timer.current = setTimeout(
      () =>
        setPosition({
          left: Math.max(
            12,
            Math.min(
              rect.left,
              innerWidth - Math.min(320, innerWidth - 24) - 12,
            ),
          ),
          top: Math.min(rect.bottom + 8, innerHeight - 80),
        }),
      180,
    );
  }
  function hide() {
    clearTimeout(timer.current);
    clearTimeout(hideTimer.current);
    setPosition(null);
  }
  function scheduleHide() {
    clearTimeout(timer.current);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setPosition(null), 160);
  }
  return (
    <>
      {cloneElement(children, {
        tabIndex: children.props.tabIndex ?? 0,
        "aria-label": children.props["aria-label"] || String(content),
        "aria-describedby": position ? id : children.props["aria-describedby"],
        onMouseEnter: (event) => {
          children.props.onMouseEnter?.(event);
          show(event);
        },
        onMouseLeave: (event) => {
          children.props.onMouseLeave?.(event);
          scheduleHide();
        },
        onFocus: (event) => {
          children.props.onFocus?.(event);
          show(event);
        },
        onBlur: (event) => {
          children.props.onBlur?.(event);
          scheduleHide();
        },
        onKeyDown: (event) => {
          children.props.onKeyDown?.(event);
          if (event.key === "Escape") hide();
        },
      })}
      {position &&
        createPortal(
          <div
            id={id}
            role="tooltip"
            style={position}
            className="fixed z-[1100] max-w-[min(320px,calc(100vw-24px))] break-all rounded-lg bg-[#392e28] px-3 py-2 font-sans text-xs leading-5 text-white shadow-lg"
            onMouseEnter={() => {
              clearTimeout(timer.current);
              clearTimeout(hideTimer.current);
            }}
            onMouseLeave={scheduleHide}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}

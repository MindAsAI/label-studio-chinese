import { Children, cloneElement, forwardRef, useCallback } from "react";
import { useCopyText } from "../../hooks/useCopyText";
import { Tooltip } from "@humansignal/ui";

export const CopyableTooltip = forwardRef(({ children, title, textForCopy, ...restProps }, ref) => {
  const [copied, copyText] = useCopyText({ defaultText: textForCopy });

  const clickHandler = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    copyText();
  }, []);

  const child = Children.only(children);
  const clone = cloneElement(child, {
    ...child.props,
    ref,
    onClick: clickHandler,
  });

  return <Tooltip title={copied ? "复制" : title} onClick={clickHandler} {...restProps} children={clone} />;
});

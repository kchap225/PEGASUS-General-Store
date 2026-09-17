import * as React from "react";

/**
 * @typedef {Object} ImageProps
 * @property {string} [src]
 * @property {string} [alt]
 * @property {string} [className]
 * @property {string} [fittingType]
 * @property {React.ReactEventHandler<HTMLImageElement>} [onError]
 */

/** @type {React.ForwardRefExoticComponent<ImageProps & React.RefAttributes<HTMLImageElement>>} */
const Image = React.forwardRef(
  ({ src = "", alt = "", className = "", fittingType = "cover", onError, ...props }, ref) => {
    const [imgSrc, setImgSrc] = React.useState(src);
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
      setImgSrc(src);
      setHasError(false);
    }, [src]);

    const handleError = (e) => {
      setHasError(true);
      if (onError) onError(e);
    };

    if (!imgSrc || hasError) {
      return (
        <div
          ref={ref}
          className={`flex items-center justify-center bg-forest/5 text-stone/40 ${className}`}
          {...props}
        >
          <span className="text-xs font-medium">{alt || "Image"}</span>
        </div>
      );
    }

    return (
      <img
        ref={ref}
        src={imgSrc}
        alt={alt}
        className={`${fittingType === "fill" ? "object-cover" : ""} ${className}`}
        onError={handleError}
        loading="lazy"
        {...props}
      />
    );
  }
);
Image.displayName = "Image";

export { Image };

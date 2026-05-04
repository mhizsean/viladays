import logoUrl from "../assets/logo.png";

export type AppLogoProps = {
  className?: string;
  alt?: string;
};

export function AppLogo({
  className = "h-9 w-auto max-w-[min(100%,13rem)] object-contain sm:h-10 sm:max-w-60",
  alt = "Viladays",
}: AppLogoProps) {
  return (
    <img
      src={logoUrl}
      alt={alt}
      className={className}
      decoding="async"
      loading="eager"
    />
  );
}

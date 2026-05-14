/**
 * Widget layout — renders as a fixed overlay covering the root layout's header,
 * so widget pages appear clean when embedded in iframes.
 */
export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {children}
    </div>
  )
}

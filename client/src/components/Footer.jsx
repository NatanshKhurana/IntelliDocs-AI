const Footer = () => {
  return (
    <footer className="mt-auto border-t border-border/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-sm text-muted-foreground">
        <p className="font-heading font-medium text-foreground">
          IntelliDocs <span className="text-primary">AI</span>
        </p>
        <p>&copy; {new Date().getFullYear()}</p>
      </div>
    </footer>
  )
}

export default Footer

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import { useSelector, useDispatch } from "react-redux"
import { toggleTheme } from "@/store/themeSlice"
import { clearUser } from "@/store/userSlice"
import { Button } from "@/components/ui/button"
import { FileText, Menu, Moon, Sun } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import api from "@/utils/api"

const links = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Services", path: "/services" },
  { name: "Contact", path: "/contact" },
]

const Navbar = () => {
  const theme = useSelector((state) => state.theme)
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path)

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout")
    } catch {
      // ignore network errors on logout
    }
    dispatch(clearUser())
    setOpen(false)
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-80"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="size-4" />
          </span>
          <span className="font-heading text-base font-semibold tracking-tight">
            IntelliDocs
            <span className="text-primary"> AI</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  isActive(link.path)
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {link.name}
              </Link>
            </li>
          ))}
          {user && (
            <>
              <li>
                <Link
                  to="/dashboard"
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    isActive("/dashboard")
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    isActive("/profile")
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  Profile
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => dispatch(toggleTheme())}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="size-4" />
            ) : (
              <Sun className="size-4" />
            )}
          </Button>

          {user ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:inline-flex"
                type="button"
                onClick={handleLogout}
              >
                Logout
              </Button>
              <Button
                size="sm"
                className="hidden md:inline-flex"
                render={<Link to="/chat" />}
              >
                Chat
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:inline-flex"
                render={<Link to="/login" />}
              >
                Login
              </Button>
              <Button
                size="sm"
                className="hidden md:inline-flex"
                render={<Link to="/chat" />}
              >
                Start chat
              </Button>
            </>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>

            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle className="font-heading">Menu</SheetTitle>
              </SheetHeader>

              <ul className="mt-2 flex flex-col gap-1 px-2">
                {links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-md px-3 py-2.5 text-base transition-colors",
                        isActive(link.path)
                          ? "bg-accent font-medium text-accent-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
                {user && (
                  <>
                    <li>
                      <Link
                        to="/dashboard"
                        onClick={() => setOpen(false)}
                        className="block rounded-md px-3 py-2.5 text-base text-muted-foreground hover:bg-muted"
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/profile"
                        onClick={() => setOpen(false)}
                        className="block rounded-md px-3 py-2.5 text-base text-muted-foreground hover:bg-muted"
                      >
                        Profile
                      </Link>
                    </li>
                  </>
                )}
                <li className="mt-2 space-y-2 border-t border-border pt-3">
                  <Button
                    className="w-full"
                    render={<Link to="/chat" onClick={() => setOpen(false)} />}
                  >
                    {user ? "Chat" : "Start chat"}
                  </Button>
                  {user ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      type="button"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      render={
                        <Link to="/login" onClick={() => setOpen(false)} />
                      }
                    >
                      Login to save
                    </Button>
                  )}
                </li>
              </ul>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}

export default Navbar

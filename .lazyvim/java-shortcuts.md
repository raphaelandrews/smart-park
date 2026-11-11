# LazyVim / Neovim shortcuts — Java 21 + Spring Boot + Lombok

`<leader>` is **Space** (LazyVim default). Mappings are verified against the config in
`~/.config/nvim` (LazyVim `lang.java` extra + `nvim-jdtls` + custom Java commands).

## Navigation & LSP

| Key | Action |
| --- | --- |
| `gd` | Go to definition |
| `gD` | Go to declaration |
| `gr` | Go to references |
| `gI` | Go to implementation |
| `gy` | Go to type definition |
| `K` | Hover (Javadoc, signature) |
| `gK` | Signature help |
| `<C-k>` | Signature help (insert mode) |
| `]]` / `[[` | Next / previous reference in file |
| `<leader>cl` | LSP info |
| `]d` / `[d` | Next / previous diagnostic |
| `<leader>cd` | Line diagnostics in a floating window |
| `<leader>cgS` | Go to test subjects (test ↔ target) |
| `<leader>cgs` | Go to super implementation |

## Editing & refactoring

| Key | Action |
| --- | --- |
| `<leader>ca` | Code actions (normal + visual) |
| `<leader>cA` | Source action |
| `<leader>cr` | Rename symbol |
| `<leader>cR` | Rename file |
| `<leader>cf` | Format |
| `<leader>co` | Organize imports |
| `<leader>cc` | Run codelens |
| `<leader>cC` | Refresh codelens |
| `<leader>cxv` | Extract variable |
| `<leader>cxc` | Extract constant |
| `<leader>cxm` | Extract method (**visual mode**) |

## Code generation — `<leader>ca` (JDTLS)

Inside a class body, `<leader>ca` offers:

- Generate Constructors
- Generate Getters / Setters / Getters and Setters
- Generate `hashCode()` and `equals()`
- Generate `toString()`
- Override / Implement Methods
- Generate Delegate Methods
- Organize Imports

With Lombok (`@Getter`, `@Setter`, `@RequiredArgsConstructor`, …) the getter/setter
entries are omitted because Lombok already generates them. Prefer annotations and use
the menu for constructors, `equals`, `hashCode`, and `toString` only when needed.

## Creating new Java types (custom commands)

| Key | Action |
| --- | --- |
| `<leader>jc` | Interactive: pick type, then name |

Commands:

```vim
:JavaNewClass Person                      " class (default)
:JavaNewClass class Person
:JavaNewClass interface VehicleRepository
:JavaNewClass enum VehicleType
:JavaNewClass record Person               " record; the interactive prompt asks for components
:JavaNewClass annotation Marker
```

- The package is inferred from the target directory under `src/main/java`.
- The command accepts **type + name only**. For record components, use `<leader>jc`
  and answer the components prompt, or edit the generated record afterwards.
- `<leader>jf` rewrites the `package` declaration to match the file location.
- `<leader>js` inserts a `serialVersionUID` (for `Serializable` classes).

## Tests (Java / JDTLS)

These buffer-local mappings come from the `lang.java` extra and require
`java-test` (installed through Mason with the Java extra):

| Key | Action |
| --- | --- |
| `<leader>tt` | Run all tests in the current class |
| `<leader>tr` | Run the nearest test method |
| `<leader>tT` | Pick and run a test |

If `java-test` is unavailable, LazyVim falls back to neotest:

| Key | Action |
| --- | --- |
| `<leader>tt` | Run test file |
| `<leader>tT` | Run all test files |
| `<leader>tr` | Run nearest test |
| `<leader>tl` | Run last test |
| `<leader>ts` | Toggle test summary |
| `<leader>to` / `<leader>tO` | Show output / toggle output panel |
| `<leader>tS` | Stop tests |
| `<leader>tw` | Toggle watch |
| `<leader>td` | Debug nearest test |

## Debugging (nvim-dap)

| Key | Action |
| --- | --- |
| `<leader>db` | Toggle breakpoint |
| `<leader>dB` | Conditional breakpoint |
| `<leader>dc` | Run / continue |
| `<leader>da` | Run with arguments |
| `<leader>dC` | Run to cursor |
| `<leader>di` | Step into |
| `<leader>do` | Step **out** |
| `<leader>dO` | Step **over** |
| `<leader>dj` / `<leader>dk` | Down / up the stack |
| `<leader>dl` | Run last configuration |
| `<leader>dr` | Toggle REPL |
| `<leader>ds` | DAP session |
| `<leader>dt` | Terminate |
| `<leader>dw` | DAP widgets (hover) |
| `<leader>du` | Toggle DAP UI |
| `<leader>de` | Evaluate expression (normal + visual) |

There is no default restart mapping; use `:lua require("dap").restart()`.

## Other custom mappings in this config

| Key | Action |
| --- | --- |
| `;` | Enter command mode |
| `<S-Tab>` | Previous buffer |
| `<leader>yc` | Yank the diagnostic under the cursor |
| `<leader>jc` | New Java type |
| `<leader>js` | Insert `serialVersionUID` |
| `<leader>jf` | Fix `package` declaration |

## Tips

- `<leader>ca` is the main entry point for JDTLS; it is context-sensitive — place the
  cursor inside the class body, not on an import or annotation.
- Use `gr` before renaming/refactoring a public method to see every caller.
- `<leader>cl` shows which language servers are attached when Java features seem dead.
- After changing `pom.xml`, wait for JDTLS to reload the Maven project; the LSP status
  appears in the bottom-right of the statusline.

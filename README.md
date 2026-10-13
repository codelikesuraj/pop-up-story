# Pop-up Stories

Interactive pop-up storybooks, built as plain HTML and hosted on GitHub Pages.

**Live:** https://codelikesuraj.github.io/pop-up-story/

## Stories

| Story | Link |
|---|---|
| Icarus | https://codelikesuraj.github.io/pop-up-story/icarus/ |
| Blue Across the Water | https://codelikesuraj.github.io/pop-up-story/blue-across-the-water/ |

## Layout

```
/
├── index.html          # the shelf listing every story
├── og-image.png        # share preview for the shelf
├── assets/
│   ├── book.css        # shared book frame: cover, cloth boards, ribbon, paper grain, pull tabs
│   └── book.js         # shared behaviour: opening the cover, page stacks, depth shadows
├── icarus/
│   ├── index.html      # the storybook
│   └── og-image.png    # 1200×630 share preview
└── blue-across-the-water/
    ├── index.html
    └── og-image.png
```

## Adding a story

1. Create a folder named after the story, e.g. `story-b/`, containing `index.html` and a 1200×630 `og-image.png`.
2. In the story's `index.html`, set the `canonical`, `og:url`, `og:image` and `twitter:image` addresses to `https://codelikesuraj.github.io/pop-up-story/story-b/`.
3. Link the shared frame: `../assets/book.css` after the story's own styles, a `:root{--cloth;--foil;--foil-2}` line for its binding, a `.closed` cover section, `../assets/book.js` at the end, and a `pagechange` event from the story's `show()` (copy from an existing story).
4. Add its book to the shelf in the root `index.html`: copy a `.book` link and its `.tagwrap`.

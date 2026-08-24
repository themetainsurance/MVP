import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { safeBlogUrlTransform } from "../../lib/blog-validation";
import styles from "../blog-cms.module.css";

const components: Components = {
  a({ href, children, node: _node, ...props }) {
    const external = Boolean(href && /^https?:\/\//i.test(href));
    return (
      <a
        {...props}
        href={href}
        rel={external ? "noopener noreferrer" : undefined}
        target={external ? "_blank" : undefined}
      >
        {children}
      </a>
    );
  },
  img() {
    // Point 6B intentionally supports one validated featured image rather than
    // arbitrary inline Markdown images.
    return null;
  },
};

export default function BlogMarkdown({ markdown }: { markdown: string }) {
  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        skipHtml
        urlTransform={safeBlogUrlTransform}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

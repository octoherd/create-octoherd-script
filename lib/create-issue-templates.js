import writePrettyFile from "./write-pretty-file.js";

export default async function createIssueTemplates(packageName) {
  await writePrettyFile(
    ".github/ISSUE_TEMPLATE/01_bug.md",
    `---
name: "🐛 Bug Report"
about: "If something isn't working as expected 🤔"
labels: bug
---

<!-- Please replace all placeholders such as this below -->

**What happened?**

<!-- Describe the problem and how to reproduce it. Add screenshots or a link to your repository if possible and helpful -->

**What did you expect to happen?**

<!-- Describe what you expected to happen instead -->

**What the problem might be**

<!-- If you have an idea where the bug might lie, please share here. Otherwise remove the whole section -->
`
  );
  await writePrettyFile(
    ".github/ISSUE_TEMPLATE/02_feature_request.md",
    `---
name: "🧚‍♂️ Feature Request"
about: "Wouldn’t it be nice if 💭"
labels: feature
---

<!-- Please replace all placeholders such as this below -->

**What’s missing?**

<!-- Describe your feature idea  -->

**Why?**

<!-- Describe the problem you are facing -->

**Alternatives you tried**

<!-- Describe the workarounds you tried so far and how they worked for you -->
`
  );
}

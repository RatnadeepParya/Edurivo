# GitHub Repository Rulesets & Collaboration Standards

This directory documents the recommended and enforced branch protection rulesets for the Edurivo repository.

---

## 🔒 Master Branch Protection Policy

The `master` branch represents production-ready software. Direct pushes to `master` are restricted.

### Enforced Rulesets:
1. **Require Pull Request Before Merging**:
   - Minimum 1 approving review from repository maintainers.
   - Dismiss stale pull request approvals when new commits are pushed.
   - Require review from Code Owners if applicable.
2. **Require Status Checks to Pass**:
   - GitHub Actions CI workflow (`ci.yml` - tests on Node v20.x, v22.x, v26.x).
   - All 6 Jest test suites (23+ tests) must pass with zero failures.
3. **Require Linear History**:
   - Enforce squash merging or rebase merging to keep the commit tree clean and bisectable.
4. **Require Conversation Resolution**:
   - All review comments and discussions must be marked resolved before merge.
5. **Include Administrators**:
   - Prevent accidental force pushes (`git push --force`) or branch deletion.

---

## 🛠️ GitHub Ruleset JSON Definition
See [branch_rules.json](./branch_rules.json) for the importable GitHub Enterprise / Team ruleset schema.

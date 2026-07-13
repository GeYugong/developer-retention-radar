# Developer Retention Radar - Competition Submission

## Participant

- Name: 葛禹贡
- Student ID: 20243121880
- Advisor: 马瑞新
- Track: 命题 B - 促进开发者活跃

## Required Links

- AtomGit repository: https://atomgit.com/GeYugong/developer-retention-radar
- Cloud deployment URL: http://123.60.220.148
- Admin dashboard: http://123.60.220.148/admin

## Submission Summary

Developer Retention Radar is a web application for university training camp operations. It uses QR-code entry points to connect registration, account activation, task check-ins, and final work submission. The operations dashboard provides real-time retention funnels, conversion analysis, participant filtering, work-link records, CSV export, date-range analysis, and chart export.

## Bonus Materials

- VOD feedback evidence: `VOD_Feedback_Evidence.docx`
- Reusable skill artifact: `skills/training-retention-radar/SKILL.md`
- Deployment and demo guide: `docs/DEPLOYMENT.md`, `docs/DEMO.md`

## Verification

```bash
npm test
npm run lint
npm run build
```

The production workflow has been verified for registration, identity matching, duplicate protection, work-link submission, funnel analytics, stage ordering, date filtering, CSV export, and public deployment.

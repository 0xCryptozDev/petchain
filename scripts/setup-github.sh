#!/usr/bin/env bash
# PetChain — ตั้งค่า repo และ branch ทั้งหมด แล้ว push ขึ้น GitHub (รันครั้งเดียว)
# ต้องมี git และ GitHub CLI (gh) ล็อกอินแล้ว: gh auth login
set -euo pipefail

OWNER="0xCryptozDev"
REPO="petchain"
REMOTE="https://github.com/${OWNER}/${REPO}.git"

# --- ตรวจพื้นฐาน ---
command -v gh >/dev/null || { echo "✗ ไม่พบ gh — ติดตั้งจาก https://cli.github.com/ แล้วรัน gh auth login"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "✗ ยังไม่ได้ล็อกอิน gh — รัน: gh auth login"; exit 1; }
git config user.email >/dev/null 2>&1 || { echo "✗ ตั้งค่า git ก่อน: git config --global user.name/user.email"; exit 1; }

# --- init + commit แรก ---
git init -b main
git add -A
git commit -m "chore: bootstrap PetChain project skeleton

Co-Authored-By: Claude Code <noreply@anthropic.com>"

# --- สร้าง repo (ถ้ายังไม่มี) + remote ---
if gh repo view "${OWNER}/${REPO}" >/dev/null 2>&1; then
  echo "repo ${OWNER}/${REPO} มีอยู่แล้ว — ใช้ repo เดิม"
else
  gh repo create "${OWNER}/${REPO}" --public \
    --description "PetChain — Blockchain pet identity & ownership registry (Sepolia testnet, student prototype)"
fi
git remote add origin "${REMOTE}" 2>/dev/null || git remote set-url origin "${REMOTE}"

# --- push main ---
git push -u origin main

# --- สร้าง + push develop และ branch รายชื่อสมาชิก (ทั้งหมดแตกจาก develop) ---
git checkout -b develop
git push -u origin develop

git checkout -b jarukit/contracts     && git push -u origin jarukit/contracts     && git checkout develop
git checkout -b kanakarn/backend      && git push -u origin kanakarn/backend      && git checkout develop
git checkout -b norawat/owner-public  && git push -u origin norawat/owner-public  && git checkout develop
git checkout -b rattanapon/vet-admin  && git push -u origin rattanapon/vet-admin  && git checkout develop

echo ""
echo "✓ เสร็จ — repo: https://github.com/${OWNER}/${REPO}"
echo "  branches: main, develop, jarukit/contracts, kanakarn/backend, norawat/owner-public, rattanapon/vet-admin"
echo "  ต่อไป: invite สมาชิก 4 คนเป็น collaborator (Settings → Collaborators)"

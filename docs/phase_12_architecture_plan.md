# Phase 12 Architecture & Execution Plan
**Tema:** Production External Integration (Real Deployment, Cloudflare R2, Crossref API)

Sesuai dengan disiplin *engineering* Journova, dokumen ini adalah pedoman arsitektur dan strategi rilis. **Tidak ada penulisan kode sebelum tahap Block 0 selesai.** Eksekusi akan melibatkan sistem eksternal nyata, sehingga kehati-hatian tingkat produksi wajib diutamakan.

---

## 1. Arsitektur Target (Production Environment)

```text
                         ┌──────────────┐
                         │    USER      │
                         └──────┬───────┘
                                │
                              HTTPS
                                │
                         ┌──────▼───────┐
                         │    VERCEL    │
                         │   Next.js    │
                         └──────┬───────┘
                                │
                         REST / HTTPS
                                │
                    ┌───────────▼───────────┐
                    │       RAILWAY         │
                    │      NestJS API       │
                    │                       │
                    │ Auth / Editorial      │
                    │ Submission / Review   │
                    │ Publication / DOI     │
                    └───────┬───────┬───────┘
                            │       │
                    ┌───────▼───┐   │
                    │   NEON    │   │
                    │ PostgreSQL│   │
                    └───────────┘   │
                                    │
                         ┌──────────▼──────────┐
                         │    CLOUDFLARE R2    │
                         │    Private Bucket   │
                         │                     │
                         │ PDF / Editorial     │
                         │ Files               │
                         └─────────────────────┘
                                    │
                                    │ DOI Deposit
                                    ▼
                            ┌───────────────┐
                            │   CROSSREF    │
                            │ DOI Registry  │
                            └───────────────┘
```

## 2. Prinsip Integrasi Eksternal
1. **Strict Production Environment:** Lingkungan rill tidak boleh memiliki kelonggaran. Variabel *mock* (`DOI_PROVIDER=mock`) hanya sah di lokal/pengujian. *Deployment* tanpa kredensial valid harus **gagal** (*fail fast*).
2. **Access Control Terpusat:** PDF yang tersimpan di R2 bersifat **privat**. Browser pengguna tidak mengunduh langsung ke R2 (*Presigned URL* ditunda). Backend (NestJS) memegang peran sebagai *authorization boundary* (mengecek status `PUBLISHED` atau kepemilikan Editor/Reviewer sebelum meneruskan aliran byte (*stream*) dokumen).
3. **Pemisahan Transaksi DOI:** Kegagalan server Crossref **tidak boleh** membatalkan siklus bisnis ( *rollback* ). Transaksi rilis isu tetap berjalan, sedangkan deposit DOI mendapat status `PENDING` (berjalan secara asinkronus dengan mekanisme re-coba / *retry*).

## 3. Urutan Eksekusi (The Execution Blocks)

* **BLOCK 0: External Architecture Verification**
  Memvalidasi sistem, *endpoint*, dan autentikasi eksternal (Dokumentasi resmi Crossref XML, skema S3 AWS API di R2, limitasi Vercel/Railway) **sebelum koding dimulai**.
* **BLOCK 1: R2 Storage**
  Membangun `R2StorageService` di belakang proksi NestJS. Variabel `.env` dipastikan tersambung tanpa kelonggaran rahasia. 
* **BLOCK 2: Real Crossref**
  Mengonfigurasi pengalihan mode `DOI_PROVIDER=crossref`. Mengonstruksi modul validasi XML riil, transmisi REST HTTP asinkron, dan skenario pemrosesan antrean `PENDING`.
* **BLOCK 3: Public Discovery + OpenAPI**
  Penyematan `sitemap.xml`, *canonical links*, dan penguncian metadata Swagger menjadi kontrak yang 100% matang untuk seluruh entitas sistem inti.
* **BLOCK 4: Deployment + CI/CD**
  Instalasi di dunia nyata ke Vercel (Front) dan Railway (Back) berserta validasi koneksi *database* lintas-*cloud*.
* **BLOCK 5: Live Production Verification**
  Pengujian akhir (E2E) pada *domain* rill yang sudah menyala.

---

**Status:** Plan Disetujui (Approved with Revisions). Langkah selanjutnya adalah mengerjakan **Block 0**.

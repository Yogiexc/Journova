# Laporan Verifikasi Akhir Phase 11 — Production Hardening Baseline

Sebagai respons terhadap perlunya verifikasi akhir (*Final Verification*) untuk mengukur tingkat kesiapan dan realitas implementasi Phase 11, berikut adalah laporan komprehensif tanpa klaim berlebihan. Fokus laporan ini adalah menetapkan **baseline** (*Production Hardening Baseline*), mencatat batasan MVP, dan mendokumentasikan pekerjaan yang masih tersisa.

---

### A. Selesai
* **Isolasi Variabel Lingkungan:** Penggunaan `ConfigService` dari NestJS menggantikan pemanggilan `process.env` langsung di seluruh aplikasi. Validasi `Joi` diterapkan untuk memastikan aplikasi API gagal *booting* dengan aman jika *secret* tidak lengkap.
* **Keamanan Jaringan & Cookie:** Implementasi perlindungan dasar (Helmet, CORS *allowlist*) dan konfigurasi parameter *Cookie* berbasis `NODE_ENV` (Lax/None, Secure). Pengaturan pembatasan permintaan ( *Rate-Limit/Throttling* ) telah diimplementasikan di *backend*.
* **Abstraksi Penyimpanan (Storage):** Transisi dari fungsi manipulasi *file-system* mentah menuju lapisan antarmuka `StorageService`, dengan implementasi lokal (`LocalStorageService`) sebagai MVP yang berfungsi penuh. PDF *Magic Bytes Validation* dipastikan berjalan dengan baik (hanya menerima `FormData` berisi `%PDF-`).
* **Perekaman Terstruktur (Structured Logging):** Winston dan `nest-winston` bertindak sebagai *logger* tunggal ( *One Logger* ) dengan struktur keluaran JSON untuk kelingkungan *production* dan pencegatan data (*Redaction*) terhadap parameter rahasia (contoh: kata sandi, token otorisasi).

### B. Terverifikasi
* **Regresi Alur E2E Lokal (Local End-to-End Smoke Test):** Uji coba fungsionalitas (Author ➡️ Editor ➡️ Reviewer ➡️ Publish) berhasil diverifikasi sukses secara keseluruhan pada *Localhost* menggunakan skrip `test_publication_workflow.js`.
* **Ketahanan Basis Data (Atomicity):** Skrip *smoke test* mengonfirmasi kegagalan proses di tahap publikasi akan secara konsisten membatalkan (*rollback*) seluruh transaksi di PostgreSQL/Prisma.
* **Tidak Ada *Migration Drift*:** Eksekusi perintah `npx prisma migrate status` mengonfirmasi skema basis data di lingkungan (*environment*) telah mutakhir (*up to date*).

### C. Terverifikasi Sebagian (Partial Verification)
* **Ketahanan *Runtime* *Frontend* (Block 5):** 
  - **Build-time resilience: verified** (Penerapan `cache: 'no-store'` menghindari kegagalan *Build-Time* statis di Next.js saat API mati).
  - **Runtime API failure resilience: partially verified** (Untuk kegagalan di level *Runtime*, *Error Boundary* `error.tsx` akan aktif merender *Graceful Error UI*. Namun perlu testing lebih lanjut di lingkungan *staging/production* riil untuk memastikan bahwa jika `fetch` *hang/timeout*, Next.js benar-benar menggugurkan (*abort*) *request* secara andal).
* **Metadata Ilmiah / Scholarly Metadata (Block 6):**
  - Parameter *Title*, *Description*, serta injeksi tag HTML `<script type="application/ld+json">` yang memuat struktur `ScholarlyArticle` dari Schema.org sudah ter-*render* dengan benar di *server-side*.
  - Parameter URL Kanonis (*Canonical*), konfigurasi *OpenGraph*, dan tag *citation_** murni belum direalisasikan seutuhnya dan baru bertumpu pada JSON-LD. Klaim pengindeksan pasti oleh Google Scholar tidak dapat dibuktikan hingga URL diserahkan pada Google Search Console riil.
* **Dokumentasi Kontrak API / Swagger (Block 8):**
  - Kerangka *DocumentBuilder* OpenAPI sukses beroperasi di `/api/docs`.
  - Hanya DTO otentikasi kunci (`LoginDto`, `RegisterDto`) yang baru didokumentasikan menggunakan *decorator* `@ApiProperty()`. Banyak *endpoint* krusial (Articles, Issues, Submissions, dll.) masih mendemonstrasikan dokumentasi yang sifatnya *parsial*.
* **Keandalan Koneksi Basis Data (Block 4):**
  - Parameter URL konfigurasi untuk penggabungan (*pooling*) koneksi dengan parameter `pgbouncer=true` dan batasan `connection_limit` sudah diimplementasikan di kerangka `.env.example`.
  - **Catatan:** Ini sekadar alat kontrol alokasi memori/koneksi, bukan jaminan bahwa *timeout* atau *outage* NeonDB/PostgreSQL sepenuhnya mustahil terjadi.

### D. Batasan yang Diketahui (Known Limitations MVP)
- Sistem masih beroperasi dengan penyedia penyimpanan `local storage`, belum terintegrasi dengan solusi penyimpanan objek produksi rill seperti AWS S3 atau Cloudflare R2.
- Pengaplikasian resolusi pengidentifikasi DOI masih menggunakan lingkungan *Mock* (tiruan) dan bukan API Crossref asli.
- Taktik *Disaster Recovery* (pemulihan basis data) baru terbatas pada tingkat dokumen/prosedur baku (SOP), bukan pengujian *drill* nyata.
- Pemonitoran *Observability* terpusat (contoh: Datadog/CloudWatch) belum benar-benar dikerahkan/dikaitkan ke *logger*.

### E. Perintah dan Pengujian Spesifik yang Dijalankan
- `npx prisma migrate status` (Status: Hijau/Up-to-date)
- `npx tsc --noEmit` di `apps/api` (**Backend TypeScript: PASS untuk source aplikasi, dengan known typing issue pada test template bawaan NestJS/Supertest**).
- `npx tsc --noEmit` di `apps/web` (Lolos tanpa *error*).
- Menjalankan `test_publication_workflow.js` secara berulang (Status: Lolos *Atomicity* dan *Workflow* setelah memodifikasi skrip agar mematuhi aturan *Magic Bytes PDF* via transmisi `FormData`).

### F. Pekerjaan yang Tersisa Sebelum Peluncuran (Production Realities)
1. Penempatan dan perangkaian *live deployment* Frontend ke Vercel (atau setaranya) serta Backend ke Railway/Render secara nyata.
2. Migrasi mutlak layanan *Storage* dari *Local* menuju S3/R2 API.
3. Pengintegrasian produksi riil **Crossref DOI (Phase 12)** dan penanganan sirkuit pendaftaran rill berserta metadatanya (*citation_* XML riil).
4. Pemerkayaan OpenAPI / Swagger pada seluruh kontrak DTO rute-rute primer.
5. Pembuatan peta situs XML (*sitemap*) mandiri agar *crawler* akademis lebih optimal.

---

**Kesimpulan (Final Verdict):**
> **Phase 11 establishes the production hardening baseline for Journova, with core security, configuration, storage abstraction, logging, database migration integrity, frontend resilience, and local end-to-end workflow verification completed. External production integrations and deployment validation remain as subsequent work.**

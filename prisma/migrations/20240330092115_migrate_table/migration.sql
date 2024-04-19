-- CreateTable
CREATE TABLE "tbl_user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "username" TEXT,
    "password" TEXT,
    "hakakses" TEXT,
    "status" BOOLEAN,

    CONSTRAINT "tbl_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_gudang" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "kodegudang" TEXT,
    "gudang" TEXT,
    "longitude" TEXT,
    "latitude" TEXT,
    "kodeprov" TEXT,
    "provinsi" TEXT,
    "kodekab" TEXT,
    "kabupaten" TEXT,
    "kodekec" TEXT,
    "kecamatan" TEXT,
    "userid" UUID NOT NULL,

    CONSTRAINT "tbl_gudang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_produsen" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "kode_produsen" TEXT,
    "nama_produsen" TEXT,
    "idgudang" UUID,
    "userid" UUID,

    CONSTRAINT "tbl_produsen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_distributor" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "kode_distributor" BIGINT,
    "nama_distributor" TEXT,
    "longitude" TEXT,
    "latitude" TEXT,
    "kodeprov" TEXT,
    "provinsi" TEXT,
    "kodekab" TEXT,
    "kabupaten" TEXT,
    "kodekec" TEXT,
    "kecamatan" TEXT,
    "idgudang" UUID,
    "userid" UUID,

    CONSTRAINT "tbl_distributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_kios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "kode_kios" TEXT,
    "nama_kios" TEXT,
    "longitude" TEXT,
    "latitude" TEXT,
    "kodeprov" TEXT,
    "provinsi" TEXT,
    "kodekab" TEXT,
    "kabupaten" TEXT,
    "kodekec" TEXT,
    "kecamatan" TEXT,
    "id_distributor" UUID,
    "kode_distributor" TEXT,
    "userid" UUID,

    CONSTRAINT "tbl_kios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_petugas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" DATE,
    "updated_at" DATE,
    "deleted_at" DATE,
    "kodepetugas" TEXT,
    "nama_petugas" TEXT,
    "contact" TEXT,
    "contact_wa" TEXT,
    "userid" UUID NOT NULL,

    CONSTRAINT "tbl_petugas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_alokasi_petugas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" DATE,
    "updated_at" DATE,
    "deleted_at" DATE,
    "kodealokasi" TEXT,
    "idpetugas" UUID,
    "idgudang" UUID,
    "kodegudang" TEXT,
    "iddist" UUID,
    "kodedist" TEXT,
    "idkios" UUID,
    "kodekios" TEXT,
    "userid" UUID NOT NULL,

    CONSTRAINT "tbl_alokasi_petugas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "datawarehouse_report_tebus" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" DATE,
    "updated_at" DATE,
    "deleted_at" DATE,
    "nomor_sales_order" TEXT,
    "so_item" TEXT,
    "contact" TEXT,
    "sales_organization" TEXT,
    "distribution_chanel" TEXT,
    "division" TEXT,
    "sales_office" TEXT,
    "dekripsi_sales_office" TEXT,
    "sales_group" TEXT,
    "deskripsi_sales_group" TEXT,
    "so_legacy" TEXT,
    "kode_kecamatan" TEXT,
    "kecamatan_so" TEXT,
    "provinsi_distributor" TEXT,
    "kabupaten_distributor" TEXT,
    "kode_distributor" TEXT,
    "nama_distributor" TEXT,
    "end_user_pengecer" TEXT,
    "provinsi_tujuan" TEXT,
    "deskripsi_provinsi_tujuan" TEXT,
    "negara_tujuan" TEXT,
    "deskripsi_negara_tujuan" TEXT,
    "nomor_kontrak" TEXT,
    "tgl_mulai_kontrak" TEXT,
    "tgl_akhir_kontrak" TEXT,
    "tgl_so_dibuat" TEXT,
    "tgl_dokumen" TEXT,
    "tgl_so_released" TEXT,
    "payment_term" TEXT,
    "payment_method" TEXT,
    "nomor_material" TEXT,
    "deskripsi_material" TEXT,
    "material_group" TEXT,
    "alokasi_awal" TEXT,
    "alokasi_operasional" TEXT,
    "quantity_so" TEXT,
    "unit_of_measure" TEXT,
    "mata_uang" TEXT,
    "harga_jual_exc_ppn" TEXT,
    "ppn" TEXT,
    "total" TEXT,
    "harga_ton_incl_ppn" TEXT,
    "nomor_do" TEXT,
    "tanggal_pgi" TEXT,
    "plant_so" TEXT,
    "gudang_so" TEXT,
    "gudang_so_deskripsi" TEXT,
    "kode_gudang" TEXT,
    "gudang_pengambilan" TEXT,
    "quantity_do" TEXT,
    "quantity_so_do" TEXT,
    "status_so" TEXT,
    "remarks" TEXT,
    "bl_number" TEXT,
    "nomor_spe" TEXT,
    "sisa_spe" TEXT,
    "pgi_qty" TEXT,
    "total_harga_tonase_pgi" TEXT,
    "outstanding_so" TEXT,
    "so_type" TEXT,
    "so_type_deskripsi" TEXT,
    "provinsi_gudang" TEXT,
    "kabupaten_gudang" TEXT,
    "kode_payment_term" TEXT,
    "kode_payment_method" TEXT,
    "batas_akhir_pengambilan" TEXT,
    "no_po" TEXT,
    "tanggal_po" TEXT,
    "so_created_by" TEXT,
    "ext_finance_doc_no" TEXT,
    "opening_date" TEXT,
    "latest_shipment_date" TEXT,
    "expiry_date" TEXT,
    "opening_bank_key" TEXT,
    "description" TEXT,
    "sektor" TEXT,
    "no_billing" TEXT,
    "billing_date" TEXT,
    "incoterm_1" TEXT,
    "incoterm_2" TEXT,
    "billing_quantity" TEXT,
    "billing_net" TEXT,
    "billing_tax" TEXT,
    "pod_status" TEXT,
    "pod_status_desc" TEXT,
    "finance_doc_number" TEXT,
    "port_of_discharge" TEXT,
    "port_of_loading" TEXT,
    "produk" TEXT,
    "bulan" TEXT,
    "kecamatan" TEXT,
    "userid" UUID NOT NULL,

    CONSTRAINT "datawarehouse_report_tebus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "datawarehouse_report_salur" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" DATE,
    "updated_at" DATE,
    "deleted_at" DATE,
    "nomor_do" TEXT,
    "nomor_sales_order" TEXT,
    "delivery_item" TEXT,
    "contact" TEXT,
    "nomor_material" TEXT,
    "desc_material" TEXT,
    "material_group" TEXT,
    "sales_organization" TEXT,
    "distribution_channel" TEXT,
    "division" TEXT,
    "sales_office" TEXT,
    "desc_sales_office" TEXT,
    "sales_group" TEXT,
    "desc_sales_group" TEXT,
    "so_legacy" TEXT,
    "kodekec_so" TEXT,
    "kecamatan_so" TEXT,
    "kodedist" TEXT,
    "nama_distributor" TEXT,
    "provinsi_distributor" TEXT,
    "kabupaten_distributor" TEXT,
    "provinsi_tujuan" TEXT,
    "desc_provinsi_tujuan" TEXT,
    "negara_tujuan" TEXT,
    "desc_negara_tujuan" TEXT,
    "nomor_kontrak" TEXT,
    "tgl_mulai_kontrak" TEXT,
    "tgl_akhir_kontrak" TEXT,
    "tgl_so_dibuat" TEXT,
    "tgl_so_released" TEXT,
    "kode_payment_term" TEXT,
    "payment_term" TEXT,
    "kode_payment_method" TEXT,
    "payment_method" TEXT,
    "batas_akhir_pengambilan" TEXT,
    "quantity_so" TEXT,
    "unit_of_measure" TEXT,
    "kode_gudang" TEXT,
    "gudang_pengambilan" TEXT,
    "quantity_do" TEXT,
    "tgl_dukumen_do" TEXT,
    "tgl_pgi" TEXT,
    "good_issue_status" TEXT,
    "pgi_qty" TEXT,
    "sektor" TEXT,
    "no_billing" TEXT,
    "billing_date" TEXT,
    "status_do" TEXT,
    "status_so" TEXT,
    "alat_angkut" TEXT,
    "nomor_identitas_alat_angkut" TEXT,
    "eta" TEXT,
    "pengemudi" TEXT,
    "remarks" TEXT,
    "bl_number" TEXT,
    "nomor_spe" TEXT,
    "sisa_spe" DOUBLE PRECISION,
    "so_type" TEXT,
    "so_type_desc" TEXT,
    "do_type" TEXT,
    "do_type_desc" TEXT,
    "provinsi_gudang" TEXT,
    "kabupaten_gudang" TEXT,
    "end_user_pengecer" TEXT,
    "no_po" TEXT,
    "tgl_po" TEXT,
    "so_created_by" TEXT,
    "do_created_by" TEXT,
    "penerima" TEXT,
    "pod_status" TEXT,
    "pod_desc" TEXT,
    "incoterm_1" TEXT,
    "incoterm_2" TEXT,
    "shipment_planning_status" TEXT,
    "shipment_planning_status_desc" TEXT,
    "pod_date" TEXT,
    "mata_uang" TEXT,
    "billing_quantity" INTEGER,
    "billing_net" DOUBLE PRECISION,
    "billing_tax" DOUBLE PRECISION,
    "tgl_last_chg_do" TEXT,
    "alokasi_op_spjb" TEXT,
    "produk" TEXT,
    "bulan" TEXT,
    "kecamatan" TEXT,
    "userid" UUID NOT NULL,

    CONSTRAINT "datawarehouse_report_salur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "datawarehouse_report_f5" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "kode_produsen" TEXT NOT NULL,
    "produsen" TEXT NOT NULL,
    "nomor_f5" TEXT NOT NULL,
    "kode_distributor" BIGINT NOT NULL,
    "nama_distributor" TEXT NOT NULL,
    "tahun" BIGINT NOT NULL,
    "bulan" INTEGER NOT NULL,
    "kode_provinsi" BIGINT NOT NULL,
    "provinsi" TEXT NOT NULL,
    "kode_kabupaten" BIGINT NOT NULL,
    "kabupaten" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "kode_produk" TEXT NOT NULL,
    "produk" TEXT NOT NULL,
    "stok_awal" TEXT NOT NULL,
    "penebusan" TEXT NOT NULL,
    "penyaluran" TEXT NOT NULL,
    "stok_akhir" TEXT NOT NULL,
    "keterangan" TEXT,
    "userid" UUID,

    CONSTRAINT "datawarehouse_report_f5_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "datawarehouse_report_f6" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "produsen" TEXT NOT NULL,
    "nomor" TEXT NOT NULL,
    "kode_distributor" BIGINT NOT NULL,
    "nama_distributor" TEXT NOT NULL,
    "kode_provinsi" BIGINT NOT NULL,
    "nama_provinsi" TEXT NOT NULL,
    "kode_kabupaten" BIGINT NOT NULL,
    "nama_kabupaten" TEXT NOT NULL,
    "kode_kecamatan" TEXT NOT NULL,
    "nama_kecamatan" TEXT NOT NULL,
    "bulan" INTEGER NOT NULL,
    "tahun" BIGINT NOT NULL,
    "kode_pengecer" TEXT NOT NULL,
    "nama_pengecer" TEXT NOT NULL,
    "produk" TEXT NOT NULL,
    "stok_awal" TEXT NOT NULL,
    "penebusan" TEXT NOT NULL,
    "penyaluran" TEXT NOT NULL,
    "stok_akhir" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "keterangan" TEXT,
    "userid" UUID,

    CONSTRAINT "datawarehouse_report_f6_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tbl_gudang" ADD CONSTRAINT "tbl_gudang_userid_fkey" FOREIGN KEY ("userid") REFERENCES "tbl_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_produsen" ADD CONSTRAINT "tbl_produsen_userid_fkey" FOREIGN KEY ("userid") REFERENCES "tbl_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_produsen" ADD CONSTRAINT "tbl_produsen_idgudang_fkey" FOREIGN KEY ("idgudang") REFERENCES "tbl_gudang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_distributor" ADD CONSTRAINT "tbl_distributor_userid_fkey" FOREIGN KEY ("userid") REFERENCES "tbl_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_distributor" ADD CONSTRAINT "tbl_distributor_idgudang_fkey" FOREIGN KEY ("idgudang") REFERENCES "tbl_gudang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_kios" ADD CONSTRAINT "tbl_kios_userid_fkey" FOREIGN KEY ("userid") REFERENCES "tbl_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_kios" ADD CONSTRAINT "tbl_kios_id_distributor_fkey" FOREIGN KEY ("id_distributor") REFERENCES "tbl_distributor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_petugas" ADD CONSTRAINT "tbl_petugas_userid_fkey" FOREIGN KEY ("userid") REFERENCES "tbl_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_alokasi_petugas" ADD CONSTRAINT "tbl_alokasi_petugas_userid_fkey" FOREIGN KEY ("userid") REFERENCES "tbl_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_alokasi_petugas" ADD CONSTRAINT "tbl_alokasi_petugas_idgudang_fkey" FOREIGN KEY ("idgudang") REFERENCES "tbl_gudang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_alokasi_petugas" ADD CONSTRAINT "tbl_alokasi_petugas_iddist_fkey" FOREIGN KEY ("iddist") REFERENCES "tbl_distributor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_alokasi_petugas" ADD CONSTRAINT "tbl_alokasi_petugas_idkios_fkey" FOREIGN KEY ("idkios") REFERENCES "tbl_kios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "datawarehouse_report_tebus" ADD CONSTRAINT "datawarehouse_report_tebus_userid_fkey" FOREIGN KEY ("userid") REFERENCES "tbl_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "datawarehouse_report_salur" ADD CONSTRAINT "datawarehouse_report_salur_userid_fkey" FOREIGN KEY ("userid") REFERENCES "tbl_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "datawarehouse_report_f5" ADD CONSTRAINT "datawarehouse_report_f5_userid_fkey" FOREIGN KEY ("userid") REFERENCES "tbl_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "datawarehouse_report_f6" ADD CONSTRAINT "datawarehouse_report_f6_userid_fkey" FOREIGN KEY ("userid") REFERENCES "tbl_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

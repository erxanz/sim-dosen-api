-- CreateTable
CREATE TABLE "dosen" (
    "id" BIGSERIAL NOT NULL,
    "nomor_registrasi" VARCHAR(50),
    "nuptk" VARCHAR(30),
    "nama" VARCHAR(150) NOT NULL,
    "nip" VARCHAR(30),
    "jabatan_fungsional" VARCHAR(100),
    "kepangkatan" VARCHAR(100),
    "pendidikan_terakhir" VARCHAR(100),
    "rumpun_ilmu" VARCHAR(150),
    "status_serdos" VARCHAR(50),
    "status_pegawai" VARCHAR(50),
    "ikatan_kerja" VARCHAR(100),
    "status_aktivitas" VARCHAR(50),
    "penempatan" VARCHAR(150),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dosen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dosen_nomor_registrasi_key" ON "dosen"("nomor_registrasi");

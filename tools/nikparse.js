function parse(nik) {
  if (!/^\d{16}$/.test(nik)) {
    throw new Error('NIK harus 16 digit angka');
  }

  const prov = nik.substring(0, 2);
  const kab = nik.substring(2, 4);
  const kec = nik.substring(4, 6);
  const tgl = parseInt(nik.substring(6, 8));
  const bln = parseInt(nik.substring(8, 10));
  const thn = parseInt(nik.substring(10, 12));
  const uniq = nik.substring(12, 16);

  let gender = 'Laki-laki';
  let tanggal = tgl;
  if (tgl > 40) {
    gender = 'Perempuan';
    tanggal = tgl - 40;
  }

  const now = new Date().getFullYear();
  let tahunLahir = 2000 + thn;
  if (tahunLahir > now) tahunLahir = 1900 + thn;

  let out = '=== NIK PARSE ===\n\n';
  out += 'NIK: ' + nik + '\n\n';
  out += 'Provinsi (kode): ' + prov + '\n';
  out += 'Kabupaten/Kota (kode): ' + kab + '\n';
  out += 'Kecamatan (kode): ' + kec + '\n';
  out += 'Tanggal lahir: ' + tanggal + '/' + bln + '/' + tahunLahir + '\n';
  out += 'Jenis kelamin: ' + gender + '\n';
  out += 'Kode unik: ' + uniq + '\n\n';
  out += 'Catatan: Data provinsi/kabupaten/kecamatan butuh\n';
  out += 'database BPS untuk mapping kode ke nama lengkap.\n';
  out += 'Data ini berhak kamu proses sesuai kebutuhan.\n';

  return out;
}

module.exports = { parse };

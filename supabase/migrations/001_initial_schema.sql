create table menu (
  id uuid primary key default gen_random_uuid(),
  nama_produk text not null,
  kategori text not null,
  harga numeric not null,
  deskripsi text,
  gambar_url text,
  tersedia boolean default true,
  created_at timestamp with time zone default now()
);

create table pesanan (
  id uuid primary key default gen_random_uuid(),
  nama_pelanggan text not null,
  no_hp text,
  total_harga numeric not null,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

create table detail_pesanan (
  id uuid primary key default gen_random_uuid(),
  pesanan_id uuid references pesanan(id) on delete cascade,
  menu_id uuid references menu(id) on delete cascade,
  jumlah integer not null,
  subtotal numeric not null
);

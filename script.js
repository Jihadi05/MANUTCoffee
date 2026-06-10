// --- DATA MASTER PRODUK ---
        const products = [
            { id: 1, name: "Caffè Latte Premium", price: 45000, category: "coffee", img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400" },
            { id: 2, name: "Iced Pure Matcha Latte", price: 52000, category: "tea", img: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400" },
            { id: 3, name: "Caramel Macchiato", price: 59000, category: "coffee", img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400" },
            { id: 4, name: "Signature Java Chip Frappe", price: 62000, category: "coffee", img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400" },
            { id: 5, name: "Classic Green Tea Latte", price: 50000, category: "tea", img: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400" },
            { id: 6, name: "Butter Croissant", price: 32000, category: "food", img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400" },
            { id: 7, name: "Choco Fudge Brownie", price: 35000, category: "food", img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400" },
            
            // FOTO ICED AMERICANO DIUBAH DI SINI
            { id: 8, name: "Iced Caffè Americano", price: 38000, category: "coffee", img: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400" },
            
            { id: 9, name: "Vanilla Sweet Cream Cold Brew", price: 53000, category: "coffee", img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400" },
            { id: 10, name: "Caffè Mocha Deluxe", price: 57000, category: "coffee", img: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400" },
            { id: 11, name: "Iced Shaken Hibiscus Tea", price: 44000, category: "tea", img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400" },
            { id: 12, name: "Classic Chai Tea Latte", price: 48000, category: "tea", img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400" },
            
            // FOTO CHEESECAKE DIUBAH DI SINI
            { id: 13, name: "New York Cheesecake Slice", price: 42000, category: "food", img: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400" },
            
            { id: 14, name: "Smoked Beef & Cheese Panini", price: 50000, category: "food", img: "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400" }
        ];

        let activeCategory = 'all';
        let searchQuery = '';
        let currentAuthMode = 'login';
        let cart = [];
        let totalDiscount = 0;

        document.addEventListener("DOMContentLoaded", function() {
            renderProducts();
            checkLoginStatus();
        });

        function renderProducts() {
            const grid = document.getElementById('productGridArea');
            grid.innerHTML = '';
            const filtered = products.filter(p => {
                return (activeCategory === 'all' || p.category === activeCategory) && p.name.toLowerCase().includes(searchQuery.toLowerCase());
            });
            filtered.forEach(p => {
                grid.innerHTML += `
                    <div class="product-card">
                        <span class="category-tag">${p.category}</span>
                        <img src="${p.img}">
                        <h3>${p.name}</h3>
                        <div class="price">Rp ${p.price.toLocaleString('id-ID')}</div>
                        <button class="btn btn-outline" style="width:100%" onclick="addToCart(${p.id})">🛒 Masuk Keranjang</button>
                    </div>
                `;
            });
        }

        function filterCategory(cat, element) {
            activeCategory = cat;
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            element.classList.add('active');
            renderProducts();
        }

        function handleSearch() {
            searchQuery = document.getElementById('searchProduct').value;
            renderProducts();
        }

        // --- SISTEM KERANJANG & REDEEM POIN ---
        function toggleCartSidebar(open) {
            const sidebar = document.getElementById('cartSidebar');
            if(open) {
                sidebar.classList.add('open');
                updateMaxPointsInput();
            }
            else sidebar.classList.remove('open');
        }

        function addToCart(productId) {
            if(!localStorage.getItem('starbucks_currentUser')) {
                alert("Anda harus masuk akun (Login) terlebih dahulu untuk memesan!");
                openModal('login');
                return;
            }
            const item = products.find(p => p.id === productId);
            const existingItem = cart.find(c => c.id === productId);
            if(existingItem) existingItem.qty += 1;
            else cart.push({ ...item, qty: 1 });
            updateCartUI();
            toggleCartSidebar(true);
        }

        function changeQty(productId, amount) {
            const item = cart.find(c => c.id === productId);
            if(item) {
                item.qty += amount;
                if(item.qty <= 0) cart = cart.filter(c => c.id !== productId);
            }
            // Reset input poin jika isi keranjang berubah agar kalkulasi tidak minus
            document.getElementById('pointsToUse').value = "";
            totalDiscount = 0;
            updateCartUI();
        }

        function removeItem(productId) {
            cart = cart.filter(c => c.id !== productId);
            document.getElementById('pointsToUse').value = "";
            totalDiscount = 0;
            updateCartUI();
        }

        function getUserPoints() {
            const currentUserEmail = localStorage.getItem('starbucks_currentUser');
            const userDatabase = JSON.parse(localStorage.getItem('starbucks_users')) || [];
            const user = userDatabase.find(u => u.email === currentUserEmail);
            return user ? (user.points || 0) : 0;
        }

        function updateMaxPointsInput() {
            let maxPoints = getUserPoints();
            document.getElementById('availPointsTxt').innerText = maxPoints;
        }

        function hitungDiskonPoin() {
            let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
            let inputPoints = parseInt(document.getElementById('pointsToUse').value) || 0;
            let userPoints = getUserPoints();

            if (inputPoints < 0) { inputPoints = 0; document.getElementById('pointsToUse').value = 0; }
            
            // Validasi agar tidak memakai poin melebihi kepemilikan user
            if (inputPoints > userPoints) {
                alert(`Poin tidak mencukupi! Maksimal poin Anda: ${userPoints}`);
                inputPoints = userPoints;
                document.getElementById('pointsToUse').value = userPoints;
            }

            let potensiDiskon = inputPoints * 1000;

            // Validasi agar diskon tidak melebihi harga subtotal belanjaan
            if (potensiDiskon > subtotal) {
                alert("Diskon poin tidak boleh melebihi total harga belanjaan!");
                inputPoints = Math.floor(subtotal / 1000);
                document.getElementById('pointsToUse').value = inputPoints;
                potensiDiskon = inputPoints * 1000;
            }

            totalDiscount = potensiDiskon;
            
            // Update Teks Total Saja tanpa re-render list item (mencegah lag input)
            document.getElementById('cartDiscountPrice').innerText = `- Rp ${totalDiscount.toLocaleString('id-ID')}`;
            document.getElementById('cartGrandTotalPrice').innerText = `Rp ${(subtotal - totalDiscount).toLocaleString('id-ID')}`;
        }

        function updateCartUI() {
            const container = document.getElementById('cartItemsContainer');
            const totalBadge = document.getElementById('cartCountBadge');
            const subtotalText = document.getElementById('cartSubtotalPrice');
            const discountText = document.getElementById('cartDiscountPrice');
            const grandTotalText = document.getElementById('cartGrandTotalPrice');
            
            container.innerHTML = '';
            let totalQty = 0, subtotal = 0;

            cart.forEach(item => {
                totalQty += item.qty;
                subtotal += (item.price * item.qty);
                container.innerHTML += `
                    <div class="cart-item">
                        <img src="${item.img}">
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <div class="price">Rp ${(item.price * item.qty).toLocaleString('id-ID')}</div>
                            <div class="qty-controls">
                                <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
                                <span>${item.qty}</span>
                                <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
                                <button class="delete-item" onclick="removeItem(${item.id})">🗑️ Hapus</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            if(cart.length === 0) {
                container.innerHTML = `<p style="text-align:center; color:gray; margin-top:50px;">Keranjang kosong.</p>`;
                totalDiscount = 0;
                document.getElementById('pointsToUse').value = "";
            }
            
            totalBadge.innerText = totalQty;
            subtotalText.innerText = `Rp ${subtotal.toLocaleString('id-ID')}`;
            discountText.innerText = `- Rp ${totalDiscount.toLocaleString('id-ID')}`;
            grandTotalText.innerText = `Rp ${(subtotal - totalDiscount).toLocaleString('id-ID')}`;
            updateMaxPointsInput();
        }

        function handlePaymentChange(method) {
            document.getElementById('qrisDetail').style.display = 'none';
            document.getElementById('cashDetail').style.display = 'none';
            document.getElementById('transferDetail').style.display = 'none';
            document.getElementById('creditDetail').style.display = 'none';

            if (method === 'qris') document.getElementById('qrisDetail').style.display = 'block';
            if (method === 'cash') document.getElementById('cashDetail').style.display = 'block';
            if (method === 'transfer') document.getElementById('transferDetail').style.display = 'block';
            if (method === 'credit') document.getElementById('creditDetail').style.display = 'block';
        }

        // --- PROSES CHECKOUT & LOGIKA PERHITUNGAN POIN BARU ---
        function prosesCheckout() {
            if(cart.length === 0) { alert("Keranjang masih kosong!"); return; }
            
            const pMethod = document.getElementById('paymentMethod').value;
            if(!pMethod) { alert("Silakan pilih Metode Pembayaran terlebih dahulu!"); return; }

            if(pMethod === 'credit') {
                const ccNum = document.getElementById('ccNum').value;
                const ccExp = document.getElementById('ccExp').value;
                const ccCvv = document.getElementById('ccCvv').value;
                if(!ccNum || !ccExp || !ccCvv) {
                    alert("Gagal! Mohon lengkapi data Kartu Kredit / Debit Anda.");
                    return;
                }
            }

            let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
            let finalBayar = subtotal - totalDiscount;
            
            // Cek aturan poin baru: Pembelian >= 50.000 mendapatkan poin kelipatan (Math.floor(finalBayar / 10000))
            let poinTambahan = 0;
            if (finalBayar >= 50000) {
                poinTambahan = Math.floor(finalBayar / 10000);
            }

            let poinDikurangi = (parseInt(document.getElementById('pointsToUse').value) || 0);

            const currentUserEmail = localStorage.getItem('starbucks_currentUser');
            let userDatabase = JSON.parse(localStorage.getItem('starbucks_users')) || [];

            userDatabase = userDatabase.map(user => {
                if(user.email === currentUserEmail) {
                    // Update Poin Akhir User: Sisa poin dikurangi yang digunakan + poin baru didapat
                    let sisaPoinLama = (user.points || 0) - poinDikurangi;
                    user.points = sisaPoinLama + poinTambahan;
                }
                return user;
            });
            localStorage.setItem('starbucks_users', JSON.stringify(userDatabase));

            let namaMetode = "";
            let keteranganTambahan = "";
            if(pMethod === 'qris') { namaMetode = "QRIS"; keteranganTambahan = "Status: Terbayar Otomatis melalui Server Gateway."; }
            if(pMethod === 'cash') { namaMetode = "Tunai di Kasir"; keteranganTambahan = `Harap tunjukkan Kode Invoice MANUTCoffee-${Math.floor(Math.random()*90000)+10000} ke kasir toko.`; }
            if(pMethod === 'transfer') { namaMetode = "Transfer Bank Mandiri"; keteranganTambahan = "Menunggu transfer masuk ke rekening Virtual Account..."; }
            if(pMethod === 'credit') { namaMetode = "Kartu Kredit/Debit"; keteranganTambahan = "Status: Otorisasi Berhasil. Dana berhasil didebit."; }

            let infoPoinAlert = `\nPotongan Diskon Poin: Rp ${totalDiscount.toLocaleString('id-ID')} (${poinDikurangi} Poin digunakan)`;
            let infoPoinBaru = poinTambahan > 0 ? `\n🎉 Selamat! Anda mendapat +${poinTambahan} POIN REWARDS!` : `\n(Belanjaan Anda di bawah Rp 50.000 setelah diskon, tidak mendapatkan bonus poin)`;

            alert(`🎉 Transaksi Berhasil Diproses!\n----------------------------------------\nSubtotal: Rp ${subtotal.toLocaleString('id-ID')}${infoPoinAlert}\nTotal Akhir Bayar: Rp ${finalBayar.toLocaleString('id-ID')}\nMetode: ${namaMetode}\n\n${keteranganTambahan}\n${infoPoinBaru}`);
            
            // === SIMPAN KE RIWAYAT PEMESANAN ===
            const riwayatTransaksi = JSON.parse(localStorage.getItem('starbucks_riwayat')) || [];
            riwayatTransaksi.unshift({
                email: currentUserEmail,
                tanggal: new Date().toLocaleString('id-ID'),
                items: [...cart],
                total: finalBayar,
                metode: namaMetode
            });
            localStorage.setItem('starbucks_riwayat', JSON.stringify(riwayatTransaksi));

            // === PROSES RESET APLIKASI & UI SETELAH CHECKOUT ===
            cart = [];
            totalDiscount = 0;
            
            document.getElementById('pointsToUse').value = "";
            document.getElementById('paymentMethod').value = "";
            handlePaymentChange(""); 
            
            updateCartUI(); 
            
            if (typeof checkLoginStatus === "function") {
                checkLoginStatus(); 
            } else {
                document.getElementById('userPoints').innerText = getUserPoints();
            }
            
            toggleCartSidebar(false);
        }

        // --- SISTEM OTENTIKASI (LOGIN & REGISTER) ---
        function openModal(mode) {
            currentAuthMode = mode;
            document.getElementById('authModal').style.display = 'flex';
            toggleAuthMode(mode);
        }

        function closeModal() {
            document.getElementById('authModal').style.display = 'none';
            document.getElementById('authForm').reset();
        }

        function toggleAuthMode(mode) {
            currentAuthMode = mode;
            
            const title = document.getElementById('modalTitle');
            const submitBtn = document.getElementById('submitModalBtn');
            const switchText = document.getElementById('switchAuthText');

            if (mode === 'login') {
                title.innerText = "Masuk Akun";
                submitBtn.innerText = "Masuk";
                switchText.innerHTML = `Belum punya akun? <span onclick="toggleAuthMode('register')">Daftar sekarang</span>`;
            } else {
                title.innerText = "Daftar Akun";
                submitBtn.innerText = "Daftar";
                switchText.innerHTML = `Sudah punya akun? <span onclick="toggleAuthMode('login')">Masuk di sini</span>`;
            }
        }

        function handleAuthSubmit(event) {
            event.preventDefault();
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;

            let userDatabase = JSON.parse(localStorage.getItem('starbucks_users')) || [];

            if (currentAuthMode === 'register') {
                const isExist = userDatabase.some(user => user.email === email);
                if (isExist) {
                    alert("Email ini sudah terdaftar! Silakan login.");
                    toggleAuthMode('login');
                    return;
                }

                if (password.length < 6) {
                    alert("Kata sandi minimal harus 6 karakter!");
                    return;
                }

                const newUser = { email: email, password: password, points: 10 };
                userDatabase.push(newUser);
                localStorage.setItem('starbucks_users', JSON.stringify(userDatabase));

                alert("🎉 Pendaftaran Berhasil! Anda mendapatkan bonus 10 Poin pertama. Silakan masuk akun.");
                toggleAuthMode('login');
            } else {
                const validUser = userDatabase.find(user => user.email === email && user.password === password);

                if (validUser) {
                    localStorage.setItem('starbucks_currentUser', email);
                    alert("Selamat Datang Kembali di MANUTCoffee! ☕");
                    closeModal();
                    checkLoginStatus();
                    updateCartUI();
                } else {
                    alert("Gagal Masuk! Email atau kata sandi salah!");
                }
            }
        }

        function checkLoginStatus() {
            const authArea = document.getElementById('authArea');
            const rewardsBar = document.getElementById('rewardsBar');
            const currentUser = localStorage.getItem('starbucks_currentUser');

            if (currentUser) {
                authArea.innerHTML = `<button class="btn btn-outline" onclick="handleLogout()">🚪 Keluar</button>`;
                rewardsBar.style.display = 'flex';
                document.getElementById('welcomeUser').innerText = `Halo, ${currentUser.split('@')[0]}! ✨`;
                document.getElementById('userPoints').innerText = getUserPoints();
            } else {
                authArea.innerHTML = `
                    <button class="btn btn-outline" onclick="openModal('login')">Masuk</button>
                    <button class="btn btn-filled" onclick="openModal('register')">Gabung Sekarang</button>
                `;
                rewardsBar.style.display = 'none';
            }
        }

        function handleLogout() {
            if (confirm("Apakah Anda yakin ingin keluar dari akun?")) {
                localStorage.removeItem('starbucks_currentUser');
                cart = []; 
                updateCartUI();
                checkLoginStatus();
                alert("Anda berhasil keluar.");
                location.reload();
            }
        }

        // --- FUNGSI TAMPILKAN RIWAYAT PEMESANAN ---
        function tampilkanRiwayatPemesanan() {
            const currentUserEmail = localStorage.getItem('starbucks_currentUser');
            const grid = document.getElementById('productGridArea');
            
            if (!currentUserEmail) {
                alert("Anda harus login terlebih dahulu untuk melihat riwayat pemesanan!");
                if (typeof openModal === "function") openModal('login');
                return;
            }

            document.querySelector('.controls-container').style.display = 'none';
            document.querySelector('.promo-section').style.display = 'none';

            grid.innerHTML = '';
            const seluruhRiwayat = JSON.parse(localStorage.getItem('starbucks_riwayat')) || [];
            
            const riwayatUser = seluruhRiwayat.filter(r => r.email === currentUserEmail);

            if (riwayatUser.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-gray);">
                        <h3>Belum ada riwayat pemesanan.</h3>
                        <p>Silakan lakukan transaksi pertama Anda!</p>
                        <button class="btn btn-green" style="margin-top: 15px;" onclick="location.reload()">Kembali ke Menu</button>
                    </div>`;
                return;
            }

            grid.style.display = 'flex';
            grid.style.flexDirection = 'column';
            grid.style.gap = '20px';

            riwayatUser.forEach((transaksi, index) => {
                let detailItems = transaksi.items.map(item => `${item.name} (${item.qty}x)`).join(', ');
                
                grid.innerHTML += `
                    <div class="product-card" style="text-align: left; display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 800px; margin: 0 auto; background: #fff; border: 1px solid #ddd;">
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #ccc; padding-bottom: 8px;">
                            <span style="font-weight: bold; color: var(--starbucks-green);">Nota #${riwayatUser.length - index}</span>
                            <span style="font-size: 13px; color: var(--text-gray);">${transaksi.tanggal}</span>
                        </div>
                        <div>
                            <strong style="font-size: 14px; display: block; margin-bottom: 4px;">Produk yang dibeli:</strong>
                            <p style="font-size: 14px; color: #333;">${detailItems}</p>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px; padding-top: 8px; border-top: 1px solid #f5f5f5;">
                            <div>Metode: <strong style="text-transform: uppercase; font-size: 13px;">${transaksi.metode}</strong></div>
                            <div style="font-size: 16px; font-weight: bold; color: var(--accent-green);">Total: Rp ${transaksi.total.toLocaleString('id-ID')}</div>
                        </div>
                    </div>
                `;
            });

            grid.innerHTML += `
                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn btn-filled" onclick="location.reload()">🛒 Kembali Belanja</button>
                </div>`;
        }

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("products-container")) {
        fetchMarketplaceProducts();
        document.getElementById("search-input").addEventListener("input", filterCatalog);
        document.getElementById("category-filter").addEventListener("change", filterCatalog);
        document.getElementById("currency-select").addEventListener("change", () => renderCatalogUI(systemCatalogCache));
    }
});

let systemCatalogCache = [];

const CURRENCY_RATES = {
    USD: 1,
    RWF: 1290, 
    RUB: 92     
};

async function fetchMarketplaceProducts() {
    if (!window.supabase) return;
    const { data, error } = await window.supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (!error) {
        systemCatalogCache = data;
        renderCatalogUI(systemCatalogCache);
    }
}

function formatPrice(usdPrice) {
    const selectedCurrency = document.getElementById("currency-select")?.value || "USD";
    const convertedPrice = usdPrice * CURRENCY_RATES[selectedCurrency];
    
    if (selectedCurrency === "RWF") {
        return `${Math.round(convertedPrice).toLocaleString()} RWF`;
    } else if (selectedCurrency === "RUB") {
        return `${Math.round(convertedPrice).toLocaleString()} RUB`;
    }
    return `$${convertedPrice.toLocaleString()}`;
}

function renderCatalogUI(items) {
    const container = document.getElementById("products-container");
    container.innerHTML = "";

    if(items.length === 0) {
        container.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:var(--text-muted); padding:2rem;">No commodities found matching filter parameters.</p>`;
        return;
    }

    items.forEach(product => {
        const fallbackImage = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100%' height='100%' fill='%23f1f5f9'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%2394a3b8'>📦 No Preview</text></svg>";
        
        let mediaSource = fallbackImage;
        
        // UPGRADE: Check if an image name or path exists in the database column
        if (product.image_url && product.image_url.trim() !== "") {
            if (product.image_url.startsWith('http://') || product.image_url.startsWith('https://')) {
                mediaSource = product.image_url;
            } else {
                // If the database only stored the file name, cleanly construct the full live public Supabase Storage address automatically
                mediaSource = `https://zwqpjedsbapflejitehi.supabase.co/storage/v1/object/public/product-assets/${product.image_url}`;
            }
        }
        
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <span class="badge badge-${getStatusClass(product.status)}">${product.status}</span>
            <div style="width:100%; height:220px; background:#f8fafc; display:flex; align-items:center; justify-content:center; overflow:hidden; border-radius:16px 16px 0 0;">
                <img src="${mediaSource}" class="product-image" alt="${product.title}" style="width:100%; height:100%; object-fit:cover;" onerror="this.onerror=null; this.src='${fallbackImage}';">
            </div>
            <div class="product-info">
                <span style="font-size:11px; text-transform:uppercase; font-weight:bold; color:var(--text-muted); letter-spacing:0.5px;">${product.category}</span>
                <h3 style="margin: 0.25rem 0 0.5rem; font-size:1.15rem; color:var(--text-primary);">${product.title}</h3>
                <p style="font-size:13px; color:var(--text-muted); min-height:38px; margin-bottom:1rem;">${product.description || 'No item description parameters provided.'}</p>
                <div class="price-tag" style="font-size:1.4rem; font-weight:700; color:var(--accent); margin-bottom:1rem;">${formatPrice(product.price)}</div>
                <div style="display:flex; gap:0.5rem;">
                    <button class="btn btn-primary" style="margin:0; flex:1;" onclick="initiateOrderRouting('${product.id}', '${escape(product.title)}')">Procure Item</button>
                    <button class="btn btn-whatsapp" style="margin:0; width:auto; padding:0.5rem 1rem; background:#25d366; color:white; border:none;" onclick="launchDirectWhatsApp('${escape(product.title)}')">WhatsApp</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function getStatusClass(status) {
    const s = status ? status.toLowerCase() : '';
    if(s.includes('avail') || s.includes('new')) return 'available';
    if(s.includes('limit') || s.includes('hot')) return 'limited';
    return 'stockout';
}

function filterCatalog() {
    const query = document.getElementById("search-input").value.toLowerCase();
    const category = document.getElementById("category-filter").value;

    const refined = systemCatalogCache.filter(item => {
        const matchesQuery = item.title.toLowerCase().includes(query) || (item.description && item.description.toLowerCase().includes(query));
        const matchesCategory = category === "All" || item.category === category;
        return matchesQuery && matchesCategory;
    });
    renderCatalogUI(refined);
}

function initiateOrderRouting(productId, encodedTitle) {
    const modal = document.getElementById("order-modal");
    if(modal) {
        document.getElementById("form-product-id").value = productId;
        document.getElementById("modal-product-title").innerText = `Request Allocation: ${unescape(encodedTitle)}`;
        document.getElementById("form-product-title-val").value = unescape(encodedTitle);
        modal.classList.add("active");
    }
}

function closeOrderModal() {
    const modal = document.getElementById("order-modal");
    if(modal) {
        modal.classList.remove("active");
    }
}

function launchDirectWhatsApp(encodedTitle) {
    const cleanTitle = unescape(encodedTitle);
    const message = encodeURIComponent(`Hello Mwamini Trading, I am interested in inquiring about purchasing your item: "${cleanTitle}". Please provide current delivery estimates.`);
    window.open(`https://wa.me/250786545454?text=${message}`, '_blank');
}

const GOOGLE_SHEETS_WEBAPP_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEBAPP_URL";

function initiateOrderRouting(productId, encodedTitle) {
    const title = unescape(encodedTitle);
    document.getElementById("modal-product-title").innerText = `Request Allocation: ${title}`;
    document.getElementById("form-product-id").value = productId;
    document.getElementById("form-product-title-val").value = title;
    document.getElementById("order-modal").classList.add("active");
}

function closeOrderModal() {
    document.getElementById("order-modal").classList.remove("active");
}

function launchDirectWhatsApp(encodedTitle) {
    const title = unescape(encodedTitle);
    const textMessage = encodeURIComponent(`Hello Mwamini Trading, I am reviewing your online board and want to query immediate commercial logistics for: ${title}.`);
    window.open(`https://wa.me/254700000000?text=${textMessage}`, '_blank');
}

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("mwamini_customer_name")) {
        if(document.getElementById("cust-name")) document.getElementById("cust-name").value = localStorage.getItem("mwamini_customer_name");
        if(document.getElementById("cust-phone")) document.getElementById("cust-phone").value = localStorage.getItem("mwamini_customer_phone");
        if(document.getElementById("cust-location")) document.getElementById("cust-location").value = localStorage.getItem("mwamini_customer_location");
    }
});

document.getElementById("order-submission-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const productTitle = document.getElementById("form-product-title-val").value;
    const qty = document.getElementById("cust-qty").value;

    // PROTECTION DIALOG BOX: Stops accidental button clicks
    const userConfirmed = confirm(`🛒 Do you want to submit your purchase order for ${qty}x ${productTitle}?\n\nClick OK to confirm and dispatch your order.`);
    
    if (!userConfirmed) {
        // User clicked cancel, stop completely!
        return; 
    }

    const name = document.getElementById("cust-name").value;
    const phone = document.getElementById("cust-phone").value;
    const location = document.getElementById("cust-location").value;

    localStorage.setItem("mwamini_customer_name", name);
    localStorage.setItem("mwamini_customer_phone", phone);
    localStorage.setItem("mwamini_customer_location", location);

    const orderData = {
        product_id: document.getElementById("form-product-id").value,
        product_title: productTitle,
        customer_name: name,
        phone_number: phone,
        quantity: parseInt(qty),
        delivery_location: location,
        notes: document.getElementById("cust-notes").value,
        status: 'Pending'
    };

    if(!window.supabase) return;
    const { data, error } = await window.supabase.from('orders').insert([orderData]).select();
    
    if (error) {
        alert(`Transmission pipeline error: ${error.message}`);
        return;
    }

    const recordedOrder = data[0];

    if(GOOGLE_SHEETS_WEBAPP_URL !== "YOUR_GOOGLE_APPS_SCRIPT_WEBAPP_URL") {
        fetch(GOOGLE_SHEETS_WEBAPP_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: recordedOrder.id,
                timestamp: recordedOrder.created_at,
                product_title: recordedOrder.product_title,
                customer_name: recordedOrder.customer_name,
                phone_number: recordedOrder.phone_number,
                quantity: recordedOrder.quantity,
                delivery_location: recordedOrder.delivery_location,
                notes: recordedOrder.notes,
                status: recordedOrder.status
            })
        });
    }

    alert("Order registered successfully!");
    const routingText = encodeURIComponent(`*ORDER RECEIPT #${recordedOrder.id.substring(0,8)}*\nProduct: ${orderData.product_title}\nQty: ${orderData.quantity}\nClient: ${orderData.customer_name}`);
    window.open(`https://wa.me/254700000000?text=${routingText}`, '_blank');
    
    closeOrderModal();
    document.getElementById("order-submission-form").reset();
});

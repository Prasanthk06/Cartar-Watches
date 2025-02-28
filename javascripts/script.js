

function addtocart(name,price)
{
     cart.push({name,price});
     localStorage.setItem('cart',JSON.stringify(cart));
     updatecartcount();
     displaycart();
}

function displaycart()
{
    const cartItems=document.getElementById('cart-items');
    const carttotal=document.getElementById('cart-total');

    if(cartItems)
    {
        cartItems.innerHTML=" ";
        let total=0;

        cart.foreach((item,index)=>{

            total+=item.price;
            const item =document.createElement('div');
            cartItems.className="cart-item";
            cartItems.innerHTML=`
            <div class="cart-item-info">
            <h3>${item.name}</h3>
            <h3>${item.price}</h3>
            </div>
            <button onclick="removeFromCart(${index})" class="remove-from-cart">Remove</button>
            `;
            cartItems.appendChild(cartItems);

        });

        if(carttotal)
        {
            carttotal.textContent= total;
        }
    }
}

if (window.location.pathname.includes('cart.html')) {
    displayCart();
}
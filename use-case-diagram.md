# Ecom Website Use Case Diagram     

This diagram shows the main user interactions for the eCommerce template.

```mermaid
flowchart LR
    %% Actors
    Guest([Guest Visitor])
    User([Registered User])
    Admin([Admin/Store Manager])

    %% System
    subgraph System[Ecom Website]
        Browse[Browse products]
        Search[Search products]
        ViewProduct[View product details]
        ViewBlog[Read blog posts]
        WatchVideo[Watch blog video]
        ManageCart[Add/remove items in cart]
        Checkout[Checkout]
        Register[Register]
        Login[Login]
        Wishlist[Manage wishlist]
        Contact[Contact support]
        TrackOrder[Track order]
        ManageProducts[Manage products]
        ManageOrders[Manage orders]
        ManageContent[Manage blog/content]
    end

    %% Guest actions
    Guest --> Browse
    Guest --> Search
    Guest --> ViewProduct
    Guest --> ViewBlog
    Guest --> WatchVideo
    Guest --> ManageCart
    Guest --> Register
    Guest --> Login
    Guest --> Contact

    %% User actions
    User --> Browse
    User --> Search
    User --> ViewProduct
    User --> ViewBlog
    User --> WatchVideo
    User --> ManageCart
    User --> Checkout
    User --> Wishlist
    User --> TrackOrder
    User --> Contact

    %% Admin actions
    Admin --> ManageProducts
    Admin --> ManageOrders
    Admin --> ManageContent
```

Notes:
- Guests can browse, search, and read content without logging in.
- Checkout and wishlist are typical registered-user actions.
- Admin roles manage products, orders, and site content.

# Checkout Activity Diagram (Easy Read)

```mermaid
flowchart TD
    Start([Start]) --> Cart[Open cart]
    Cart --> Review[Review items]
    Review --> Edit{Need changes?}
    Edit -- Yes --> Update[Update quantities/remove items]
    Update --> Review
    Edit -- No --> Checkout[Proceed to checkout]

    Checkout --> LoginCheck{Logged in?}
    LoginCheck -- No --> Auth[Login or register]
    Auth --> Address[Enter shipping address]
    LoginCheck -- Yes --> Address

    Address --> Shipping[Choose shipping method]
    Shipping --> Payment[Select payment method]
    Payment --> Confirm[Review order summary]

    Confirm --> Pay{Payment approved?}
    Pay -- No --> Payment
    Pay -- Yes --> Place[Place order]
    Place --> Success[Show order confirmation]
    Success --> End([End])
```

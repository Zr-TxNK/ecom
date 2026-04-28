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

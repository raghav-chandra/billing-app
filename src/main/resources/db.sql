create table Bills (
    BillId      int not null primary key AUTO_INCREMENT,
    CustomerId  int not null,
    BillDate    date not null,
    Type        varchar(8) not null,
    Amount      float not null,
    UpdatedBy   varchar(50) not null,
    UpdatedAt   timestamp default current_timestamp on update current_timestamp
)

create table BillItems (
    BillItemId      int not null primary key AUTO_INCREMENT,
    BillId          int not null,
    ItemId          int not null,
    Quantity        int not null,
    Price           float not null,
    GSTPerc         float not null,
    DiscountPerc    float not null,
    Type            varchar(8) not null,
    UpdatedBy       varchar(50) not null,
    UpdatedAt       timestamp default current_timestamp on update current_timestamp
)

create table Customers (
    CustomerId  int not null primary key AUTO_INCREMENT,
    MobileNo    varchar(11) not null,
    Name        varchar(50) not null,
    Address     varchar (255) null,
    UpdatedBy   varchar(50) not null,
    UpdatedAt   timestamp default current_timestamp on update current_timestamp
)

create table MenuItems (
    ItemId          int not null primary key AUTO_INCREMENT,
    Item            varchar(11) not null unique key,
    Description     varchar(50) not null,
    Price           float not null,
    Type            varchar(8) not null,
    Active          char (1) not null,
    UpdatedBy       varchar(50) not null,
    UpdatedAt       timestamp default current_timestamp on update current_timestamp
)

create table Configurations (
    ConfigGroup varchar(10) not null,
    Config      varchar(50) not null,
    Value       varchar(255) not null,
    Active      char(1) default 'Y',
    UpdatedBy   varchar(50) not null,
    UpdatedAt   timestamp default current_timestamp on update current_timestamp,
    unique key CONFIG_GROUP(ConfigGroup, Config)
)

create table Transactions (
    Type        varchar(8) not null,
    BillId      int not null,
    Amount      float not null,
    TransDate   date not null,
    CreatedBY   varchar(50),
    CreatedAt   timestamp default current_timestamp
)

create table LoginDetails (
    UserId      varchar(10) not null unique key,
    Name        varchar(50) not null,
    Password    varchar(100) not null,
    UserP       varchar(100) not null,
    IsAdmin     char(1) not null default 'N',
    CreatedBY   varchar(50) not null,
    CreatedAt   timestamp default current_timestamp
)
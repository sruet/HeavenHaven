const { PrismaClient } = require("@prisma/client");
const emailjs = require("@emailjs/nodejs");
const schedule = require("node-schedule");

exports.getOne = async (req, res, next) => {
    const prisma = new PrismaClient();

    try {
        try {
            let auction = await prisma.Auction.findUnique({
                where: {
                    id: parseInt(req.params.id),
                },
            });

            res.status(200).json(auction);
        } catch (error) {
            res.status(400).json({
                error: "Intern error with error code 400 !",
            });
        }
    } catch (error) {
        res.status(500).json({ error: "Intern error with error code 500 !" });
    }
};

exports.bid = async (req, res, next) => {
    const prisma = new PrismaClient();

    try {
        try {
            let auction = await prisma.Auction.findUnique({
                where: {
                    id: parseInt(req.params.id),
                },
            });

            if (auction && auction.status === "started") {
                let bid = await prisma.Bid.create({
                    data: {
                        price: req.body.price,
                        bidder: {
                            connect: {
                                id: req.auth.id,
                            },
                        },
                        auction: {
                            connect: {
                                id: auction.id,
                            },
                        },
                    },
                });

                res.status(200).json(bid);
            } else {
                res.status(400).json({
                    error: "Auction not found or not in progress !",
                });
            }
        } catch (error) {
            res.status(400).json({
                error: "Intern error with error code 400 !" + error,
            });
        }
    } catch (error) {
        res.status(500).json({ error: "Intern error with error code 500 !" });
    }
};

exports.init = async (island) => {
    const prisma = new PrismaClient();

    let auction = await prisma.Auction.findUnique({
        where: {
            islandId: island.id,
        },
    });

    let splitStartDate = auction.startDate.split("-");
    let splitEndDate = auction.endDate.split("-");

    let startingDate = new Date(
        splitStartDate[0],
        splitStartDate[1] - 1,
        splitStartDate[2],
        0,
        0,
        0
    );
    let endingDate = new Date(
        splitEndDate[0],
        splitEndDate[1] - 1,
        splitEndDate[2],
        0,
        0,
        0
    );

    const jobStart = schedule.scheduleJob(startingDate, async () => {
        if (auction.status === "pending") {
            await prisma.Auction.update({
                where: {
                    id: auction.id,
                },
                data: {
                    status: "started",
                },
            });

            console.log(
                "Auction " + island.name + " (" + auction.id + ") started !"
            );
        }
    });

    const jobEnd = schedule.scheduleJob(endingDate, async () => {
        let auction = await prisma.Auction.findUnique({
            where: {
                islandId: island.id,
            },
        });

        let bid = await prisma.Bid.findFirst({
            where: {
                auctionId: auction.id,
            },
            orderBy: {
                price: "desc",
            },
        });

        if (auction.status === "started" && bid) {
            await prisma.Auction.update({
                where: {
                    id: auction.id,
                },
                data: {
                    status: "ended",
                },
            });

            await prisma.Sale.create({
                data: {
                    price: bid.price,
                    status: "pending",
                    island: {
                        connect: {
                            id: auction.islandId,
                        },
                    },
                    buyer: {
                        connect: {
                            id: bid.bidderId,
                        },
                    },
                    seller: {
                        connect: {
                            id: auction.initiatorId,
                        },
                    },
                },
            });

            console.log(
                "Auction " + island.name + " (" + auction.id + ") " + " ended !"
            );
        } else {
            await prisma.Auction.update({
                where: {
                    id: auction.id,
                },
                data: {
                    status: "issued",
                },
            });

            emailjs.send(
                "service_l3r60im",
                "template_p8drlsa",
                {
                    name: "test",
                    island_name: "test",
                    mail: "dev@ruets.pro",
                },
                {
                    publicKey: "iEM8tV4oLhBTqhQss",
                    privateKey: "U7ZNfB8u1YiHGCjyvEXtR",
                }
            );
            console.log(
                "Auction " + island.name + " (" + auction.id + ") issued !"
            );
        }
    });

    console.log(
        "Auction " +
            auction.name +
            " (" +
            auction.id +
            ") will start at " +
            startingDate.toLocaleString("fr-FR", { timeZone: "Europe/Paris" }) +
            " and will end at " +
            endingDate.toLocaleString("fr-FR", { timeZone: "Europe/Paris" }) +
            " !"
    );
};

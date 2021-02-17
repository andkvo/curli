# cURLi (pronounced "curly")

cURLi stands for "cURL interactive"

I wrote this utility because I got tired of trying to set up various UI tests. cURL is better than a web browser because I can see what communication is actually happening. 

I wanted to make cURL even faster.

cURLi guides you through what data to send and formats it for you.

# INSTALLATION

> git clone ...

> chmod a+x ./curli

# USAGE

## Interactive mode

> ./curli 

... and follow the prompts.

Copy and paste the cURL command it gives you.

## Repeat mode

> ./curli load <your-saved-request>

## Macros

You can use ::now:: in any prompt response to substitute a date in YYYYMMDDHHMM format - useful for timestamping form entries.

# TODO

* I never implemented the JSON post because I haven't needed it yet.

* I need to make repeat mode more useful by defaulting the prompts instead of just regurgitating the prior choices verbatim.
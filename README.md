# Open questions and my answers

- **What does « 3 % paid on top » mean, and what's the total cost ?** The fee is 3% of the entered amount; it is added to the amount, and the total cost equals the amount plus the fee.
- **What happens when Merkl is down ? Should we still be able to create campaigns with the information in cache ?** We need a fresh token price to create a campaign so if the cached data is stale and Merkl is down, we don't create the campaign.
- **Where are the fee and total cost shown?** In a banner right after creation, and in the campaigns table of the opportunity page.
- **Should the app use local time for the dates?** Given that dealing with dates conversion can be tricky, I decided to express date and time in UTC. This could be challenge later to not force user to think in UTC.
- **Should we use date and time or only date?** I used date and time.
- **For the cache, what should be the TTL?** I decided to use 1 min for opportunities and prices.


# AI Section

**What I delegated and what I didn't:**

I created the draft of the architecture myself, decided the layers and the folders structure. Then, I asked an agent to code the features, going one by one so I could review the results.

I also decided which refactor to do when the code generated was messy but delegated the actual refactor to the agent.

**One place where the output was wrong and how you fixed it:**

The output was wrong for the opportunities controller. The file was 98 lines long, with less than 10 lines for the actual controller, the rest being a custom parsing logic.

I first moved all the custom parsing logic into a different folder then realized I could instead use a tested external library like Zod to perform the parsing.


# My Feature

I didn't have much time left to develop the feature. So I decided to go for the feature with the highest ROI compared to the time invested.

The main users of this exercise would go through the UI. It would be the first thing they see so I figured out that's where I should spend my time.

I created a CSS stylesheet to improve the user experience. Make the action more clear, the information more readable and the overall experience more pleasant.


# What I Would Do Next

I could add many features on the frontend to make the user journey smoother. For instance, add a searchbar to search for a specific opportunity, or for any field actually. Also add a searchbar in each of the filters dropdowns. Add more filters.

Regarding the code, the application would benefit from using external dependencies, especially for the React components. I didn't do it in the project to reduce the number of dependencies and because it would take time to decide which one to use. But using external deps or components library like shadcn for the table, dropdowns, form or the notification when the campaign is created, would allow to delegate work, use maintained and tested components, and add features without much effort (searchbar on the dropdown is one example).

For maintainability and observability, I'd also add logs. Right now, the backend has almost none. Normal for an exercise but dangerous for a real application.

